import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService, BOT_FAQ } from './services/i18n.service';
import { I18nPipe } from './services/i18n.pipe';
import { SessionService } from './services/session.service';
import { UiStateService } from './services/ui-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, I18nPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  currentDateStr: string = '';
  botOpen: boolean = false;
  botInput: string = '';
  botMessages: Array<{ sender: 'bot' | 'user'; text: string }> = [];

  constructor(
    public i18n: I18nService,
    public session: SessionService,
    public ui: UiStateService
  ) {}

  ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    this.greet();
  }

  private greet() {
    const greeting = this.i18n.isHindi
      ? 'नमस्ते! मैं AICTE सहायक हूँ, आपका स्वचालित विनियामक सहायक। APAAR ID सत्यापन, ABC क्रेडिट, सीट कोटा या डुप्लिकेट संबंधी किसी भी जानकारी हेतु पूछें।'
      : 'Namaste! I am AICTE Sahayak, your automated regulatory assistant. How can I assist you with APAAR ID verification, ABC credits, intake quotas or duplicate enrolment handling?';
    this.botMessages = [{ sender: 'bot', text: greeting }, ...this.botMessages.slice(1)];
  }

  updateTime() {
    const now = new Date();
    this.currentDateStr = now.toLocaleString(this.i18n.isHindi ? 'hi-IN' : 'en-IN', {
      weekday: 'long',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  }

  get navPortals(): Array<{ route: string; labelKey: string; badgeKey: string }> {
    const all = [
      { route: '/student', labelKey: 'nav.student', badgeKey: 'nav.badge.direct' },
      { route: '/college', labelKey: 'nav.college', badgeKey: 'nav.badge.intake' },
      { route: '/aicte', labelKey: 'nav.aicte', badgeKey: 'nav.badge.national' },
    ];
    const s = this.session.session();
    if (!s) return all; // public browsing before sign-in
    return all.filter(p => p.route === this.session.homeRoute);
  }

  get signedInAs(): string | null {
    const s = this.session.session();
    return s ? s.email : null;
  }

  signOut() {
    this.session.signOut();
  }

  toggleLang() {
    this.i18n.toggle();
    this.greet();
  }

  toggleBot() {
    this.botOpen = !this.botOpen;
  }

  readonly faqChips: Array<{ query: string; key: string }> = [
    { query: 'What is APAAR ID?', key: 'bot.faq.apaar' },
    { query: 'How are duplicate enrolments handled?', key: 'bot.faq.duplicate' },
    { query: 'What is the approved intake rule?', key: 'bot.faq.intake' },
    { query: 'Explain ABC credits', key: 'bot.faq.credits' },
    { query: 'What is DigiLocker?', key: 'bot.faq.digilocker' },
    { query: 'How to export reports?', key: 'bot.faq.report' },
  ];

  sendBotMessage(query?: string) {
    const text = query || this.botInput;
    if (!text.trim()) return;

    this.botMessages.push({ sender: 'user', text });
    if (!query) this.botInput = '';

    setTimeout(() => {
      this.botMessages.push({ sender: 'bot', text: this.botAnswer(text) });
    }, 400);
  }

  private botAnswer(text: string): string {
    const l = text.toLowerCase();
    const hindi = this.i18n.isHindi;

    // Score each FAQ entry by keyword hits (longer keywords weigh more)
    let best: { score: number; en: string; hi: string } | null = null;
    for (const faq of BOT_FAQ) {
      let score = 0;
      for (const kw of faq.keywords) {
        if (l.includes(kw)) score += kw.length;
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { score, en: faq.en, hi: faq.hi };
      }
    }

    if (best) return hindi ? best.hi : best.en;

    return hindi
      ? 'इस प्रश्न पर मेरे पास कोई विशिष्ट उत्तर नहीं है। कृपया APAAR ID, ABC क्रेडिट, डिजिलॉकर, सीट कोटा, डुप्लिकेट नामांकन, पंजीकरण या रिपोर्ट के बारे में पूछें — या AICTE हेल्पलाइन (011) 29581333 पर संपर्क करें।'
      : 'I do not have a specific answer for that yet. Try asking about APAAR ID, ABC credits, DigiLocker, intake quotas, duplicate enrolments, registration or reports — or contact the AICTE helpline at (011) 29581333.';
  }
}
