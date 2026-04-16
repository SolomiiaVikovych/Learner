from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Deck, Card
from .serializers import DeckSerializer, CardSerializer

class DeckViewSet(viewsets.ModelViewSet):
    queryset = Deck.objects.all().order_by('-created_at')
    serializer_class = DeckSerializer


class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer

    def get_queryset(self):
        queryset = Card.objects.all()
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
