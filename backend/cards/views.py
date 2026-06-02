from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Deck, Card, StudySession
from .serializers import DeckSerializer, CardSerializer, StudySessionSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)
    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'User created successfully'}, status=201)


class DeckViewSet(viewsets.ModelViewSet):
    serializer_class = DeckSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Deck.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Card.objects.filter(deck__owner=self.request.user)
        deck_id = self.request.query_params.get('deck', None)
        if deck_id is not None:
            queryset = queryset.filter(deck=deck_id)
        due_only = self.request.query_params.get('due', None)
        if due_only == 'true':
            queryset = queryset.filter(next_review__lte=timezone.now())
        return queryset.order_by('next_review')

    @action(detail=True, methods=['patch'])
    def toggle_known(self, request, pk=None):
        card = self.get_object()
        card.is_known = not card.is_known
        card.save()
        return Response(CardSerializer(card).data)

    @action(detail=True, methods=['patch'])
    def review(self, request, pk=None):
        card = self.get_object()
        known = request.data.get('known', False)
        card.update_spaced_repetition(known)
        return Response(CardSerializer(card).data)


class StudySessionViewSet(viewsets.ModelViewSet):
    serializer_class = StudySessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StudySession.objects.filter(user=self.request.user).order_by('-started_at')
        deck_id = self.request.query_params.get('deck', None)
        if deck_id is not None:
            queryset = queryset.filter(deck=deck_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        session = self.get_object()
        session.completed_at = timezone.now()
        session.cards_reviewed = request.data.get('cards_reviewed', 0)
        session.cards_known = request.data.get('cards_known', 0)
        session.save()
        return Response(StudySessionSerializer(session).data)