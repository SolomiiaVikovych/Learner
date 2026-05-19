from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import Deck, Card
from .serializers import DeckSerializer, CardSerializer

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
        return queryset

    @action(detail=True, methods=['patch'])
    def toggle_known(self, request, pk=None):
        card = self.get_object()
        card.is_known = not card.is_known
        card.save()
        return Response(CardSerializer(card).data)