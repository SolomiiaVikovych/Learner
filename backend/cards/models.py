from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Deck(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='decks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Card(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='cards')
    term = models.CharField(max_length=200)
    explanation = models.TextField()
    is_known = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Spaced repetition fields
    ease_factor = models.FloatField(default=2.5)
    interval = models.IntegerField(default=1)
    next_review = models.DateTimeField(default=timezone.now)
    review_count = models.IntegerField(default=0)

    def update_spaced_repetition(self, known):
        if known:
            if self.review_count == 0:
                self.interval = 1
            elif self.review_count == 1:
                self.interval = 3
            else:
                self.interval = round(self.interval * self.ease_factor)
            self.ease_factor = max(1.3, self.ease_factor + 0.1)
            self.is_known = True
        else:
            self.interval = 1
            self.ease_factor = max(1.3, self.ease_factor - 0.2)
            self.is_known = False

        self.review_count += 1
        self.next_review = timezone.now() + timezone.timedelta(days=self.interval)
        self.save()

    def __str__(self):
        return self.term


class StudySession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='study_sessions')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cards_reviewed = models.IntegerField(default=0)
    cards_known = models.IntegerField(default=0)

    @property
    def score_percentage(self):
        if self.cards_reviewed == 0:
            return 0
        return round((self.cards_known / self.cards_reviewed) * 100)

    def __str__(self):
        return f'{self.user.username} - {self.deck.title} - {self.started_at.date()}'