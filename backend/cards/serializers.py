from rest_framework import serializers
from .models import Deck, Card, StudySession


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            'id', 'deck', 'term', 'explanation', 'is_known',
            'created_at', 'ease_factor', 'interval', 'next_review', 'review_count'
        ]


class DeckSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    card_count = serializers.SerializerMethodField()
    known_count = serializers.SerializerMethodField()
    due_count = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = [
            'id', 'title', 'description', 'created_at',
            'cards', 'card_count', 'known_count', 'due_count'
        ]

    def get_card_count(self, obj):
        return obj.cards.count()

    def get_known_count(self, obj):
        return obj.cards.filter(is_known=True).count()

    def get_due_count(self, obj):
        from django.utils import timezone
        return obj.cards.filter(next_review__lte=timezone.now()).count()


class StudySessionSerializer(serializers.ModelSerializer):
    deck_title = serializers.CharField(source='deck.title', read_only=True)
    score_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = StudySession
        fields = [
            'id', 'deck', 'deck_title', 'started_at', 'completed_at',
            'cards_reviewed', 'cards_known', 'score_percentage'
        ]