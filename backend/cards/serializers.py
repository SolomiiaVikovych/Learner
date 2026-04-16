from rest_framework import serializers
from .models import Deck, Card

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'deck', 'term', 'explanation', 'is_known', 'created_at']


class DeckSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    card_count = serializers.SerializerMethodField()
    known_count = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = ['id', 'title', 'description', 'created_at', 'cards', 'card_count', 'known_count']

    def get_card_count(self, obj):
        return obj.cards.count()

    def get_known_count(self, obj):
        return obj.cards.filter(is_known=True).count()