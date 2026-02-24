'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

/* ─── DEFAULTS ──────────────────────────────────────────────────────── */
const DEFAULTS = {
  header_logo_text: "DIGI-GREEN",
  header_logo_highlight: "FUTURE",
  footer_desc: "Kapaklı Belediyesi liderliğinde yürütülen sürdürülebilir kalkınma projesi.",
  footer_column2_title: "Hızlı Menü",
  footer_column3_title: "İletişim",
  footer_eu_logo: "/assets/images/eu-flag.png",
  footer_disclaimer: "Funded by the European Union.",
  contact_email: "info@digigreen.eu",
  contact_phone: "+90 282 717 10 10",
  hero_title: "Yerel Yeşil Gelecek İçin Dijital Dönüşüm",
  hero_desc: "Erasmus+ KA220-ADU kapsamında, iklim değişikliği ile mücadelede dijital araçları kullanmayı hedefleyen öncü proje.",
  home_summary_1_val: "24 Ay", home_summary_1_label: "Proje Süresi",
  home_summary_2_val: "250.000€", home_summary_2_label: "Toplam Hibe",
  home_summary_3_val: "KA220-ADU", home_summary_3_label: "Program",
  home_summary_4_val: "3 Ülke", home_summary_4_label: "Kapsam",
  home_about_title: "Teknoloji ve Doğanın Mükemmel Uyumu",
  home_about_text: "Projemiz, iklim kriziyle mücadelede yerel yönetimler ve vatandaşların aktif rol alması gerekliliğinden doğmuştur.",
  home_target_1_title: "Vatandaşlar", home_target_1_desc: "Mobil uygulamalar ile geri dönüşüme katılın.",
  home_target_2_title: "Yerel Yönetimler", home_target_2_desc: "Veriye dayalı kararlar alarak kaynakları verimli kullanın.",
  home_target_3_title: "STK ve Akademik", home_target_3_desc: "Araştırma ve eğitim çalışmalarında aktif rol alın.",
  home_counter_1_val: "250000", home_counter_1_label: "Toplam Hibe (€)",
  home_counter_2_val: "3", home_counter_2_label: "Ortak Ülke",
  home_counter_3_val: "5", home_counter_3_label: "Proje Ortağı",
  home_counter_4_val: "24", home_counter_4_label: "Ay Süre",
  home_cta_title: "Geleceği Birlikte Tasarlayalım",
  home_cta_text: "Daha fazla bilgi almak için bize ulaşın."
};

/* ─── GLOBAL STYLES ──────────────────────────────────────────────────── */
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d1117;
    --surface: #161b22;
    --surface-2: #1c2333;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.15);
    --accent: #22c55e;
    --accent-dim: rgba(34,197,94,0.12);
    --accent-glow: rgba(34,197,94,0.25);
    --blue: #3b82f6;
    --blue-dim: rgba(59,130,246,0.12);
    --red: #ef4444;
    --red-dim: rgba(239,68,68,0.12);
    --yellow: #f59e0b;
    --text-primary: #e6edf3;
    --text-secondary: #7d8590;
    --text-muted: #484f58;
    --sidebar-w: 260px;
    --radius: 10px;
    --radius-lg: 14px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
    --font: 'DM Sans', sans-serif;
    --font-display: 'Syne', sans-serif;
    --transition: 0.18s cubic-bezier(0.4,0,0.2,1);
  }

  html, body { height: 100%; }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text-primary);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .adm-layout {
    display: flex;
    min-height: 100vh;
  }

  .adm-sidebar {
    width: var(--sidebar-w);
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    overflow-y: auto;
  }

  .adm-sidebar::-webkit-scrollbar { width: 4px; }
  .adm-sidebar::-webkit-scrollbar-track { background: transparent; }
  .adm-sidebar::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 4px; }

  .adm-brand {
    padding: 24px 20px 20px;
    border-bottom: 1px solid var(--border);
  }

  .adm-brand-logo {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .adm-brand-logo span {
    color: var(--accent);
  }

  .adm-brand-icon {
    width: 34px; height: 34px;
    background: var(--accent-dim);
    border: 1px solid rgba(34,197,94,0.3);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: var(--accent);
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .adm-brand-sub {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 4px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .adm-nav {
    padding: 16px 12px;
    flex: 1;
  }

  .adm-nav-section {
    margin-bottom: 24px;
  }

  .adm-nav-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 0 8px;
    margin-bottom: 6px;
  }

  .adm-nav-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
    position: relative;
    margin-bottom: 2px;
  }

  .adm-nav-btn:hover {
    background: var(--surface-2);
    color: var(--text-primary);
  }

  .adm-nav-btn.active {
    background: var(--accent-dim);
    color: var(--accent);
  }

  .adm-nav-btn.active .adm-nav-icon {
    color: var(--accent);
  }

  .adm-nav-icon {
    width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem;
    flex-shrink: 0;
    transition: var(--transition);
  }

  .adm-nav-badge {
    margin-left: auto;
    background: var(--accent);
    color: #000;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
    min-width: 20px;
    text-align: center;
  }

  .adm-sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid var(--border);
  }

  .adm-signout {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border-radius: 8px;
    border: 1px solid rgba(239,68,68,0.2);
    background: var(--red-dim);
    color: var(--red);
    font-family: var(--font);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
  }

  .adm-signout:hover {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.4);
  }

  .adm-main {
    margin-left: var(--sidebar-w);
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .adm-topbar {
    height: 60px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 32px;
    gap: 16px;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .adm-topbar-title {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
    flex: 1;
  }

  .adm-topbar-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-dim);
    border: 1px solid rgba(34,197,94,0.25);
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 0.75rem;
    color: var(--accent);
    font-weight: 600;
  }

  .adm-topbar-pill span.dot {
    width: 6px; height: 6px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }

  .adm-content {
    padding: 32px;
    flex: 1;
  }

  .adm-page-header {
    margin-bottom: 28px;
  }

  .adm-page-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .adm-page-title em {
    color: var(--accent);
    font-style: normal;
  }

  .adm-page-desc {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .adm-section {
    margin-bottom: 36px;
  }

  .adm-section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  .adm-section-num {
    width: 26px; height: 26px;
    background: var(--accent-dim);
    border: 1px solid rgba(34,197,94,0.3);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--accent);
    flex-shrink: 0;
    font-family: var(--font-display);
  }

  .adm-section-title {
    font-family: var(--font-display);
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .adm-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px;
    margin-bottom: 12px;
  }

  .adm-card-grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .adm-card-inner {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
  }

  .adm-card-inner-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--blue);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .adm-card-inner-label::before {
    content: '';
    width: 3px; height: 14px;
    background: var(--blue);
    border-radius: 2px;
    display: block;
  }

  .adm-field {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    margin-bottom: 10px;
    transition: border-color var(--transition);
  }

  .adm-field:hover {
    border-color: var(--border-hover);
  }

  .adm-field-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .adm-field-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.01em;
  }

  .adm-field-key {
    font-size: 0.65rem;
    color: var(--text-muted);
    font-family: monospace;
    background: var(--surface-2);
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid var(--border);
  }

  .adm-field-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .adm-input {
    flex: 1;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 0.875rem;
    padding: 10px 14px;
    transition: border-color var(--transition), box-shadow var(--transition);
    outline: none;
    width: 100%;
  }

  .adm-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  .adm-input::placeholder {
    color: var(--text-muted);
  }

  .adm-textarea {
    flex: 1;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 0.875rem;
    padding: 10px 14px;
    resize: vertical;
    transition: border-color var(--transition), box-shadow var(--transition);
    outline: none;
    width: 100%;
    line-height: 1.5;
  }

  .adm-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  .adm-textarea::placeholder {
    color: var(--text-muted);
  }

  .adm-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: none;
    border-radius: 8px;
    font-family: var(--font);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
    line-height: 1;
    padding: 0 16px;
    height: 38px;
  }

  .adm-btn-save {
    background: var(--accent);
    color: #000;
  }

  .adm-btn-save:hover {
    background: #16a34a;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px var(--accent-glow);
  }

  .adm-btn-primary {
    background: var(--blue);
    color: white;
  }

  .adm-btn-primary:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(59,130,246,0.3);
  }

  .adm-btn-danger {
    background: transparent;
    border: 1px solid rgba(239,68,68,0.3);
    color: var(--red);
  }

  .adm-btn-danger:hover {
    background: var(--red-dim);
    border-color: rgba(239,68,68,0.6);
  }

  .adm-btn-ghost {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }

  .adm-btn-ghost:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
  }

  .adm-btn-success {
    background: var(--accent-dim);
    border: 1px solid rgba(34,197,94,0.3);
    color: var(--accent);
  }

  .adm-btn-success:hover {
    background: rgba(34,197,94,0.2);
  }

  .adm-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  .adm-img-field {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  .adm-img-preview-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 10px;
    gap: 10px;
    overflow: hidden;
  }

  .adm-img-thumb {
    width: 32px; height: 32px;
    object-fit: cover;
    border-radius: 5px;
    flex-shrink: 0;
  }

  .adm-img-url-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 0.8rem;
    outline: none;
  }

  .adm-img-url-input::placeholder { color: var(--text-muted); }

  .adm-upload-btn {
    width: 38px; height: 38px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem;
    transition: var(--transition);
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .adm-upload-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
  }

  .adm-upload-btn input[type=file] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .adm-item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    margin-bottom: 8px;
    transition: border-color var(--transition);
  }

  .adm-item-row:hover {
    border-color: var(--border-hover);
  }

  .adm-item-info strong {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .adm-item-info span {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .adm-item-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .adm-form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin-bottom: 24px;
  }

  .adm-form-card-title {
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between; /* Butonu sağa hizalamak için */
  }

  .adm-form-card-title i {
    color: var(--accent);
  }

  .adm-form-grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .adm-form-grid3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }

  .adm-form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .adm-form-item label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .adm-input-full {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 0.875rem;
    padding: 10px 14px;
    transition: border-color var(--transition), box-shadow var(--transition);
    outline: none;
    width: 100%;
  }

  .adm-input-full:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  .adm-input-full::placeholder { color: var(--text-muted); }

  .adm-select-full {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 0.875rem;
    padding: 10px 14px;
    transition: border-color var(--transition);
    outline: none;
    width: 100%;
    cursor: pointer;
    appearance: none;
  }

  .adm-select-full:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  .adm-textarea-full {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 0.875rem;
    padding: 10px 14px;
    transition: border-color var(--transition), box-shadow var(--transition);
    outline: none;
    width: 100%;
    resize: vertical;
    line-height: 1.5;
  }

  .adm-textarea-full:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  .adm-textarea-full::placeholder { color: var(--text-muted); }

  .adm-form-submit {
    width: 100%;
    height: 44px;
    background: var(--accent);
    color: #000;
    border: none;
    border-radius: 8px;
    font-family: var(--font);
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    margin-top: 4px;
  }

  .adm-form-submit:hover {
    background: #16a34a;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px var(--accent-glow);
  }

  .adm-slider-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px;
    margin-bottom: 8px;
    transition: border-color var(--transition);
  }

  .adm-slider-item:hover {
    border-color: var(--border-hover);
  }

  .adm-slider-idx {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-muted);
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .adm-slider-thumb {
    width: 64px; height: 42px;
    object-fit: cover;
    border-radius: 5px;
    flex-shrink: 0;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .adm-slider-url {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-family: monospace;
    font-size: 0.78rem;
    outline: none;
    min-width: 0;
  }

  .adm-slider-url:focus { color: var(--text-primary); }

  .adm-arrow-btn {
    width: 30px; height: 30px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem;
    transition: var(--transition);
    flex-shrink: 0;
  }

  .adm-arrow-btn:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
  }

  .adm-arrow-btn:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  .adm-eco-item {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
    position: relative;
    transition: border-color var(--transition);
  }

  .adm-eco-item:hover {
    border-color: var(--border-hover);
  }

  .adm-eco-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .adm-eco-idx {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--accent);
    font-family: var(--font-display);
  }

  .adm-subtabs {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }

  .adm-subtab {
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    text-transform: capitalize;
  }

  .adm-subtab:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
  }

  .adm-subtab.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #000;
    font-weight: 600;
  }

  .adm-msg-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
    margin-bottom: 12px;
    transition: border-color var(--transition);
  }

  .adm-msg-card:hover {
    border-color: var(--border-hover);
  }

  .adm-msg-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .adm-msg-sender {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
  }

  .adm-msg-email {
    font-size: 0.75rem;
    color: var(--accent);
    margin-top: 2px;
  }

  .adm-msg-body {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.6;
    padding: 12px;
    background: var(--surface-2);
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .adm-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 14px 18px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    animation: slideIn 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes slideIn {
    from { transform: translateX(110%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .adm-toast-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .adm-toast-icon.success {
    background: var(--accent-dim);
    color: var(--accent);
    border: 1px solid rgba(34,197,94,0.25);
  }

  .adm-toast-icon.error {
    background: var(--red-dim);
    color: var(--red);
    border: 1px solid rgba(239,68,68,0.25);
  }

  .adm-toast-text strong {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .adm-toast-text span {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .adm-toast-close {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1rem;
    padding: 4px;
    transition: color var(--transition);
    flex-shrink: 0;
  }

  .adm-toast-close:hover { color: var(--text-primary); }

  .adm-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .adm-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    width: 400px;
    max-width: 90vw;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    animation: scaleIn 0.2s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes scaleIn {
    from { transform: scale(0.92); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .adm-modal-icon {
    width: 48px; height: 48px;
    background: var(--red-dim);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    color: var(--red);
    margin: 0 auto 16px;
  }

  .adm-modal h3 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .adm-modal p {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .adm-modal-btns {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .adm-loading {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    gap: 16px;
  }

  .adm-loading-spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .adm-loading p {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .adm-divider {
    border: none;
    border-top: 1px dashed var(--border);
    margin: 16px 0;
  }

  .adm-slider-add {
    border: 1px dashed var(--border-hover);
    border-radius: var(--radius);
    padding: 14px;
    margin-top: 12px;
    background: var(--surface-2);
  }

  .adm-slider-add-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .adm-empty {
    text-align: center;
    padding: 40px;
    color: var(--text-muted);
    font-size: 0.875rem;
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
  }

  .adm-empty i {
    display: block;
    font-size: 2rem;
    margin-bottom: 12px;
    opacity: 0.4;
  }

  .adm-counter-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .adm-fade-in {
    animation: fadeUp 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .adm-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 9px;
    border-radius: 20px;
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .adm-badge-green {
    background: var(--accent-dim);
    color: var(--accent);
    border: 1px solid rgba(34,197,94,0.25);
  }

  .adm-badge-blue {
    background: var(--blue-dim);
    color: var(--blue);
    border: 1px solid rgba(59,130,246,0.25);
  }

  .adm-badge-yellow {
    background: rgba(245,158,11,0.12);
    color: var(--yellow);
    border: 1px solid rgba(245,158,11,0.25);
  }
`;

/* ─── TOAST ──────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className="adm-toast">
      <div className={`adm-toast-icon ${type}`}>
        <i className={type === 'error' ? 'fas fa-xmark' : 'fas fa-check'} />
      </div>
      <div className="adm-toast-text">
        <strong>{type === 'error' ? 'Hata oluştu' : 'Başarılı'}</strong>
        <span>{message}</span>
      </div>
      <button className="adm-toast-close" onClick={onClose}><i className="fas fa-xmark" /></button>
    </div>
  );
};

/* ─── CONFIRM MODAL ──────────────────────────────────────────────────── */
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal">
        <div className="adm-modal-icon"><i className="fas fa-trash" /></div>
        <h3>Emin misiniz?</h3>
        <p>{message}</p>
        <div className="adm-modal-btns">
          <button className="adm-btn adm-btn-ghost" onClick={onCancel}>Vazgeç</button>
          <button className="adm-btn adm-btn-danger" style={{background:'var(--red)', color:'white', border:'none'}} onClick={onConfirm}>
            <i className="fas fa-trash" /> Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── SETTING INPUT ──────────────────────────────────────────────────── */
const SettingInput = ({ label, settingKey, type = 'text', placeholder = '', settings, handleSettingChange, updateSetting, uploadFile }) => {
  const settingItem = settings.find(s => s.key === settingKey);
  const val = settingItem ? settingItem.value : (DEFAULTS[settingKey] || '');

  return (
    <div className="adm-field">
      <div className="adm-field-header">
        <span className="adm-field-label">{label}</span>
        <span className="adm-field-key">{settingKey}</span>
      </div>
      <div className="adm-field-row">
        {type === 'textarea' ? (
          <textarea className="adm-textarea" value={val} onChange={e => handleSettingChange(settingKey, e.target.value)} placeholder={placeholder} rows={3} />
        ) : type === 'image' ? (
          <div className="adm-img-field">
            <div className="adm-img-preview-wrap">
              {val ? <img src={val} className="adm-img-thumb" alt="" onError={e => e.target.style.display='none'} /> : <i className="fas fa-link" style={{color:'var(--text-muted)', fontSize:'0.8rem'}} />}
              <input type="text" className="adm-img-url-input" value={val} onChange={e => handleSettingChange(settingKey, e.target.value)} placeholder="URL girin veya dosya yükleyin..." />
            </div>
            <label className="adm-upload-btn" title="Masaüstünden Yükle">
              <i className="fas fa-upload" />
              <input type="file" hidden onChange={async e => {
                const url = await uploadFile(e.target.files[0]);
                if (url) { handleSettingChange(settingKey, url); updateSetting(settingKey, url); }
              }} />
            </label>
          </div>
        ) : (
          <input type="text" className="adm-input" value={val} onChange={e => handleSettingChange(settingKey, e.target.value)} placeholder={placeholder} />
        )}
        <button className="adm-btn adm-btn-save" onClick={() => updateSetting(settingKey, val)}>
          <i className="fas fa-floppy-disk" /> Kaydet
        </button>
      </div>
    </div>
  );
};

/* ─── FILE INPUT ─────────────────────────────────────────────────────── */
const FileInput = ({ value, onChange, placeholder, uploadFile, showToast }) => {
  const [uploading, setUploading] = useState(false);
  const handleFile = async e => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const url = await uploadFile(file);
      if (url) { onChange(url); if (showToast) showToast('Dosya başarıyla yüklendi.', 'success'); }
    } catch { if (showToast) showToast('Yükleme hatası oluştu.', 'error'); }
    finally { setUploading(false); }
  };
  return (
    <div className="adm-img-field">
      <div className="adm-img-preview-wrap">
        {value ? <img src={value} className="adm-img-thumb" alt="" onError={e => e.target.style.display='none'} /> : <i className="fas fa-link" style={{color:'var(--text-muted)', fontSize:'0.8rem'}} />}
        <input type="text" className="adm-img-url-input" placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
      </div>
      <label className="adm-upload-btn" title="Yükle">
        {uploading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-upload" />}
        <input type="file" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
};

/* ─── SECTION HEADER ─────────────────────────────────────────────────── */
const SectionHeader = ({ num, title }) => (
  <div className="adm-section-header">
    <div className="adm-section-num">{num}</div>
    <div className="adm-section-title">{title}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [subTab, setAboutSubTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState([]);
  const [news, setNews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [partners, setPartners] = useState([]);
  const [results, setResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [ecoItems, setEcoItems] = useState([]);
  const [heroImages, setHeroImages] = useState([]);

  // Form stateleri
  const [newsForm, setNewsForm] = useState({ id: null, title: '', title_en: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '', date: '' });
  const [activityForm, setActivityForm] = useState({ id: null, title: '', title_en: '', type: 'Toplantı (TPM)', type_en: '', location: '', location_en: '', date: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '' });
  const [partnerForm, setPartnerForm] = useState({ id: null, name: '', name_en: '', country: '', country_en: '', image_url: '', flag_url: '', website: '', description: '', description_en: '', role: 'Ortak', role_en: '' });
  const [resultForm, setResultForm] = useState({ id: null, title: '', title_en: '', description: '', description_en: '', status: 'Planlanıyor', status_en: '', link: '', icon: 'file' });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const showConfirm = (message, onConfirm) => setModal({ isOpen: true, message, onConfirm });
  const closeConfirm = () => setModal({ ...modal, isOpen: false });
  const handleConfirmAction = () => { if (modal.onConfirm) modal.onConfirm(); closeConfirm(); };

  useEffect(() => { checkSessionAndLoad(); }, []);

  async function checkSessionAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }
    await loadAllData();
    setLoading(false);
  }

  async function loadAllData() {
    const s = await supabase.from('settings').select('*').order('id');
    const n = await supabase.from('news').select('*').order('date', { ascending: false });
    const a = await supabase.from('activities').select('*').order('id', { ascending: false });
    const p = await supabase.from('partners').select('*').order('id');
    const r = await supabase.from('results').select('*').order('id');
    const m = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });

    setSettings(s.data || []);
    setNews(n.data || []);
    setActivities(a.data || []);
    setPartners(p.data || []);
    setResults(r.data || []);
    setMessages(m.data || []);

    const ecoStr = s.data?.find(x => x.key === 'home_eco_list')?.value;
    if (ecoStr) { try { setEcoItems(JSON.parse(ecoStr)); } catch(e){} }
    else {
      setEcoItems([
        { title: 'Mobil Uygulama', desc: 'Vatandaşlara yönelik dijital araçlar.', icon: 'fa-mobile-screen' },
        { title: 'Geri Dönüşüm', desc: 'Çevre dostu alışkanlıklar.', icon: 'fa-recycle' },
        { title: 'Eğitim', desc: 'Farkındalık ve kapasite geliştirme.', icon: 'fa-graduation-cap' },
        { title: 'Doğa', desc: 'Sürdürülebilir yaşam pratikleri.', icon: 'fa-leaf' }
      ]);
    }

    const heroSliderStr = s.data?.find(x => x.key === 'hero_slider_images')?.value;
    if (heroSliderStr) { try { setHeroImages(JSON.parse(heroSliderStr)); } catch(e){} }
    else {
      const oldHeroBg = s.data?.find(x => x.key === 'hero_bg_image')?.value;
      if (oldHeroBg) setHeroImages([oldHeroBg]);
    }
  }

  // ✨ YENİ: OTOMATİK ÇEVİRİ FONKSİYONU
  const autoTranslateText = async (text) => {
    if (!text) return '';
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=en&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
    } catch (error) {
        console.error("Çeviri hatası:", error);
        return text; 
    }
  }

  // Çeviri Tetikleyicileri
  const handleTranslateNews = async (e) => {
    e.preventDefault();
    setIsTranslating(true);
    showToast('Otomatik çeviri yapılıyor, lütfen bekleyin...', 'success');
    
    const t_title = await autoTranslateText(newsForm.title);
    const t_summary = await autoTranslateText(newsForm.summary);
    const t_desc = await autoTranslateText(newsForm.description);
    
    setNewsForm(prev => ({...prev, title_en: t_title, summary_en: t_summary, description_en: t_desc}));
    setIsTranslating(false);
    showToast('Çeviri başarıyla tamamlandı!', 'success');
  };

  const handleTranslateActivities = async (e) => {
    e.preventDefault();
    setIsTranslating(true);
    showToast('Otomatik çeviri yapılıyor, lütfen bekleyin...', 'success');
    
    const t_title = await autoTranslateText(activityForm.title);
    const t_type = await autoTranslateText(activityForm.type);
    const t_loc = await autoTranslateText(activityForm.location);
    const t_summary = await autoTranslateText(activityForm.summary);
    const t_desc = await autoTranslateText(activityForm.description);
    
    setActivityForm(prev => ({...prev, title_en: t_title, type_en: t_type, location_en: t_loc, summary_en: t_summary, description_en: t_desc}));
    setIsTranslating(false);
    showToast('Çeviri başarıyla tamamlandı!', 'success');
  };

  const handleTranslatePartners = async (e) => {
    e.preventDefault();
    setIsTranslating(true);
    showToast('Otomatik çeviri yapılıyor, lütfen bekleyin...', 'success');
    
    const t_name = await autoTranslateText(partnerForm.name);
    const t_country = await autoTranslateText(partnerForm.country);
    const t_desc = await autoTranslateText(partnerForm.description);
    
    setPartnerForm(prev => ({...prev, name_en: t_name, country_en: t_country, description_en: t_desc}));
    setIsTranslating(false);
    showToast('Çeviri başarıyla tamamlandı!', 'success');
  };

  const handleTranslateResults = async (e) => {
    e.preventDefault();
    setIsTranslating(true);
    showToast('Otomatik çeviri yapılıyor, lütfen bekleyin...', 'success');
    
    const t_title = await autoTranslateText(resultForm.title);
    const t_desc = await autoTranslateText(resultForm.description);
    
    setResultForm(prev => ({...prev, title_en: t_title, description_en: t_desc}));
    setIsTranslating(false);
    showToast('Çeviri başarıyla tamamlandı!', 'success');
  };

  // Diğer Fonksiyonlar
  const handleEcoChange = (index, field, value) => {
    const newItems = [...ecoItems];
    newItems[index][field] = value;
    setEcoItems(newItems);
  };

  const saveEcoItems = async (itemsToSave) => {
    setEcoItems(itemsToSave);
    const { error } = await supabase.from('settings').upsert({ key: 'home_eco_list', value: JSON.stringify(itemsToSave) }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error');
    else showToast('Ağaç kutuları güncellendi.', 'success');
  };

  const saveHeroImages = async (newArr) => {
    setHeroImages(newArr);
    const { error } = await supabase.from('settings').upsert({ key: 'hero_slider_images', value: JSON.stringify(newArr) }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error');
    else showToast('Slider güncellendi.', 'success');
  };

  const moveHeroImage = (index, direction) => {
    const newArr = [...heroImages];
    if (direction === -1 && index > 0) { [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]]; }
    else if (direction === 1 && index < newArr.length - 1) { [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]]; }
    saveHeroImages(newArr);
  };

  async function uploadFile(file) {
    if (!file) return null;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) { showToast('Yükleme Hatası: ' + error.message, 'error'); return null; }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrl;
  }

  const handleSettingChange = (key, newValue) => {
    setSettings(prev => {
      const exists = prev.find(item => item.key === key);
      if (exists) return prev.map(item => item.key === key ? { ...item, value: newValue } : item);
      return [...prev, { key, value: newValue }];
    });
  };

  async function updateSetting(key, value) {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) showToast('Hata: ' + error.message, 'error');
    else showToast('Ayar kaydedildi.', 'success');
  }

  async function deleteItem(table, id) {
    showConfirm('Bu öğeyi kalıcı olarak silmek istediğinizden emin misiniz?', async () => {
      await supabase.from(table).delete().eq('id', id);
      loadAllData();
      showToast('Başarıyla silindi.', 'success');
    });
  }

  async function saveItem(e, table, form, setForm) {
    e.preventDefault();
    const { id, ...data } = form;
    let result = id
      ? await supabase.from(table).update(data).eq('id', id)
      : await supabase.from(table).insert([data]);
    if (result?.error) { showToast('Hata: ' + result.error.message, 'error'); return; }
    setIsEditing(false);
    loadAllData();
    showToast('Başarıyla kaydedildi.', 'success');
    
    if (table === 'news') setNewsForm({ id: null, title: '', title_en: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '', date: '' });
    if (table === 'activities') setActivityForm({ id: null, title: '', title_en: '', type: 'Toplantı (TPM)', type_en: '', location: '', location_en: '', date: '', summary: '', summary_en: '', description: '', description_en: '', image_url: '' });
    if (table === 'partners') setPartnerForm({ id: null, name: '', name_en: '', country: '', country_en: '', image_url: '', flag_url: '', website: '', description: '', description_en: '', role: 'Ortak', role_en: '' });
    if (table === 'results') setResultForm({ id: null, title: '', title_en: '', description: '', description_en: '', status: 'Planlanıyor', status_en: '', link: '', icon: 'file' });
  }

  function startEdit(item, type) {
    setIsEditing(true);
    if (type === 'news') setNewsForm({ id: item.id, title: item.title, title_en: item.title_en || '', summary: item.summary || '', summary_en: item.summary_en || '', description: item.description || '', description_en: item.description_en || '', image_url: item.image_url || '', date: item.date || '' });
    if (type === 'activities') setActivityForm({ id: item.id, title: item.title, title_en: item.title_en || '', type: item.type || 'Toplantı (TPM)', type_en: item.type_en || '', location: item.location || '', location_en: item.location_en || '', date: item.date || '', summary: item.summary || '', summary_en: item.summary_en || '', description: item.description || '', description_en: item.description_en || '', image_url: item.image_url || '' });
    if (type === 'partners') setPartnerForm({ id: item.id, name: item.name, name_en: item.name_en || '', country: item.country, country_en: item.country_en || '', image_url: item.image_url, flag_url: item.flag_url, website: item.website || '', description: item.description || '', description_en: item.description_en || '', role: item.role || 'Ortak', role_en: item.role_en || '' });
    if (type === 'results') setResultForm({ id: item.id, title: item.title, title_en: item.title_en || '', description: item.description || '', description_en: item.description_en || '', status: item.status || 'Planlanıyor', status_en: item.status_en || '', link: item.link || '', icon: item.icon || 'file' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const commonProps = { settings, handleSettingChange, updateSetting, uploadFile };

  const NAV = [
    { id: 'messages', label: `Mesajlar`, icon: 'fas fa-inbox', badge: messages.length, group: 'Genel' },
    { id: 'home', label: 'Ana Sayfa', icon: 'fas fa-house', group: 'İçerik' },
    { id: 'about', label: 'Hakkında', icon: 'fas fa-circle-info', group: 'İçerik' },
    { id: 'news', label: 'Haberler', icon: 'fas fa-newspaper', badge: news.length, group: 'İçerik' },
    { id: 'activities', label: 'Faaliyetler', icon: 'fas fa-calendar-check', badge: activities.length, group: 'İçerik' },
    { id: 'partners', label: 'Ortaklar', icon: 'fas fa-handshake', badge: partners.length, group: 'İçerik' },
    { id: 'results', label: 'Çıktılar', icon: 'fas fa-file-circle-check', badge: results.length, group: 'İçerik' },
    { id: 'contact', label: 'İletişim', icon: 'fas fa-phone', group: 'Ayarlar' },
    { id: 'site', label: 'Site Ayarları', icon: 'fas fa-sliders', group: 'Ayarlar' },
  ];

  const groupedNav = NAV.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const currentTab = NAV.find(n => n.id === activeTab);

  if (loading) return (
    <div className="adm-loading">
      <style>{globalStyle}</style>
      <div className="adm-loading-spinner" />
      <p>Yükleniyor...</p>
    </div>
  );

  return (
    <>
      <style>{globalStyle}</style>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <ConfirmModal isOpen={modal.isOpen} message={modal.message} onConfirm={handleConfirmAction} onCancel={closeConfirm} />

      <div className="adm-layout">
        {/* ── SIDEBAR ── */}
        <aside className="adm-sidebar">
          <div className="adm-brand">
            <div className="adm-brand-logo">
              <div className="adm-brand-icon"><i className="fas fa-leaf" /></div>
              DIGI-<span>GREEN</span>
            </div>
            <div className="adm-brand-sub">Yönetim Paneli</div>
          </div>

          <nav className="adm-nav">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="adm-nav-section">
                <div className="adm-nav-label">{group}</div>
                {items.map(item => (
                  <button
                    key={item.id}
                    className={`adm-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => { setActiveTab(item.id); setIsEditing(false); }}
                  >
                    <span className="adm-nav-icon"><i className={item.icon} /></span>
                    {item.label}
                    {item.badge > 0 && <span className="adm-nav-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="adm-sidebar-footer">
            <button className="adm-signout" onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}>
              <i className="fas fa-arrow-right-from-bracket" /> Çıkış Yap
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-title">
              {currentTab && <><i className={currentTab.icon} style={{marginRight:'10px', color:'var(--accent)'}} />{currentTab.label}</>}
            </div>
            <div className="adm-topbar-pill">
              <span className="dot" /> Canlı
            </div>
          </div>

          <div className="adm-content">

            {/* ══ MESAJLAR ══════════════════════════════════════════════ */}
            {activeTab === 'messages' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Gelen <em>Mesajlar</em></div>
                  <div className="adm-page-desc">{messages.length} adet mesaj bulunuyor.</div>
                </div>
                {messages.length === 0 ? (
                  <div className="adm-empty"><i className="fas fa-inbox" />Henüz mesaj yok.</div>
                ) : messages.map(msg => (
                  <div key={msg.id} className="adm-msg-card">
                    <div className="adm-msg-header">
                      <div>
                        <div className="adm-msg-sender">{msg.name}</div>
                        <div className="adm-msg-email">{msg.email}</div>
                      </div>
                      <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('contact_messages', msg.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                    <div className="adm-msg-body">{msg.message}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ══ ANA SAYFA ══════════════════════════════════════════════ */}
            {activeTab === 'home' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Ana Sayfa <em>Düzenle</em></div>
                </div>

                {/* 1. SLIDER */}
                <div className="adm-section">
                  <SectionHeader num="1" title="Kapak Slider Resimleri" />
                  <div className="adm-card">
                    <p style={{fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'14px'}}>
                      Resimleri sürükleyip sıralayabilir, ok butonlarıyla yukarı/aşağı taşıyabilirsiniz.
                    </p>
                    {heroImages.map((img, i) => (
                      <div key={i} className="adm-slider-item">
                        <span className="adm-slider-idx">{i + 1}</span>
                        <img src={img} className="adm-slider-thumb" alt="" onError={e => e.target.style.background='var(--surface-2)'} />
                        <input className="adm-slider-url" placeholder="Resim URL" value={img}
                          onChange={e => { const a = [...heroImages]; a[i] = e.target.value; setHeroImages(a); }} />
                        <button className="adm-arrow-btn" onClick={() => moveHeroImage(i, -1)} disabled={i === 0} title="Yukarı">
                          <i className="fas fa-chevron-up" />
                        </button>
                        <button className="adm-arrow-btn" onClick={() => moveHeroImage(i, 1)} disabled={i === heroImages.length - 1} title="Aşağı">
                          <i className="fas fa-chevron-down" />
                        </button>
                        <button className="adm-btn adm-btn-danger" style={{height:'30px', padding:'0 10px', fontSize:'0.75rem'}}
                          onClick={() => saveHeroImages(heroImages.filter((_, idx) => idx !== i))}>
                          <i className="fas fa-xmark" />
                        </button>
                      </div>
                    ))}
                    <div className="adm-slider-add">
                      <div className="adm-slider-add-label"><i className="fas fa-plus" /> Yeni Resim Ekle</div>
                      <FileInput value="" onChange={url => { if (url) saveHeroImages([...heroImages, url]); }}
                        placeholder="URL yapıştırın veya dosya yükleyin..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    <button className="adm-btn adm-btn-ghost" style={{marginTop:'12px'}} onClick={() => saveHeroImages(heroImages)}>
                      <i className="fas fa-floppy-disk" /> URL Değişikliklerini Kaydet
                    </button>
                  </div>
                </div>

                {/* 2. HERO */}
                <div className="adm-section">
                  <SectionHeader num="2" title="Kapak Başlığı & Açıklaması" />
                  <SettingInput label="Ana Başlık (TR)" settingKey="hero_title" {...commonProps} />
                  <SettingInput label="Açıklama Metni (TR)" settingKey="hero_desc" type="textarea" {...commonProps} />
                  
                  {/* İngilizce Ayarları */}
                  <div style={{marginTop: '15px', borderTop: '1px dashed var(--border)', paddingTop: '15px'}}>
                    <SettingInput label="Ana Başlık (EN)" settingKey="hero_title_en" {...commonProps} />
                    <SettingInput label="Açıklama Metni (EN)" settingKey="hero_desc_en" type="textarea" {...commonProps} />
                  </div>
                </div>

                {/* 3. ÖZET KARTLAR */}
                <div className="adm-section">
                  <SectionHeader num="3" title="Özet Bilgi Kartları" />
                  <div className="adm-card-grid2">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="adm-card-inner">
                        <div className="adm-card-inner-label">Kart {n}</div>
                        <SettingInput label="Değer (TR)" settingKey={`home_summary_${n}_val`} {...commonProps} />
                        <SettingInput label="Etiket (TR)" settingKey={`home_summary_${n}_label`} {...commonProps} />
                        
                        <div style={{marginTop: '10px', borderTop: '1px dashed var(--border)', paddingTop: '10px'}}>
                          <SettingInput label="Değer (EN)" settingKey={`home_summary_${n}_val_en`} {...commonProps} />
                          <SettingInput label="Etiket (EN)" settingKey={`home_summary_${n}_label_en`} {...commonProps} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. HAKKINDA */}
                <div className="adm-section">
                  <SectionHeader num="4" title="Hakkında Bölümü" />
                  <SettingInput label="Sol Taraf Görseli" settingKey="home_about_image" type="image" {...commonProps} />
                  <SettingInput label="Bölüm Başlığı (TR)" settingKey="home_about_title" {...commonProps} />
                  <SettingInput label="Bölüm Metni (TR)" settingKey="home_about_text" type="textarea" {...commonProps} />
                  
                  <div style={{marginTop: '15px', borderTop: '1px dashed var(--border)', paddingTop: '15px'}}>
                    <SettingInput label="Bölüm Başlığı (EN)" settingKey="home_about_title_en" {...commonProps} />
                    <SettingInput label="Bölüm Metni (EN)" settingKey="home_about_text_en" type="textarea" {...commonProps} />
                  </div>
                </div>

                {/* 5. HEDEF KİTLE */}
                <div className="adm-section">
                  <SectionHeader num="5" title="Hedef Kitle Kartları" />
                  {[1, 2, 3].map(n => (
                    <div key={n} className="adm-card-inner" style={{marginBottom:'10px'}}>
                      <div className="adm-card-inner-label">Hedef {n}</div>
                      <SettingInput label="Başlık (TR)" settingKey={`home_target_${n}_title`} {...commonProps} />
                      <SettingInput label="Açıklama (TR)" settingKey={`home_target_${n}_desc`} type="textarea" {...commonProps} />
                      
                      <div style={{marginTop: '10px', borderTop: '1px dashed var(--border)', paddingTop: '10px'}}>
                        <SettingInput label="Başlık (EN)" settingKey={`home_target_${n}_title_en`} {...commonProps} />
                        <SettingInput label="Açıklama (EN)" settingKey={`home_target_${n}_desc_en`} type="textarea" {...commonProps} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 7. SAYAÇLAR */}
                <div className="adm-section">
                  <SectionHeader num="7" title="Etki Sayaçları" />
                  <div className="adm-counter-grid">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="adm-card-inner">
                        <div className="adm-card-inner-label">Sayaç {n}</div>
                        <SettingInput label="Değer" settingKey={`home_counter_${n}_val`} {...commonProps} />
                        <SettingInput label="Etiket (TR)" settingKey={`home_counter_${n}_label`} {...commonProps} />
                        <SettingInput label="Etiket (EN)" settingKey={`home_counter_${n}_label_en`} {...commonProps} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. CTA */}
                <div className="adm-section">
                  <SectionHeader num="8" title="Alt Kapanış (CTA)" />
                  <SettingInput label="Başlık (TR)" settingKey="home_cta_title" {...commonProps} />
                  <SettingInput label="Metin (TR)" settingKey="home_cta_text" type="textarea" {...commonProps} />
                  
                  <div style={{marginTop: '15px', borderTop: '1px dashed var(--border)', paddingTop: '15px'}}>
                    <SettingInput label="Başlık (EN)" settingKey="home_cta_title_en" {...commonProps} />
                    <SettingInput label="Metin (EN)" settingKey="home_cta_text_en" type="textarea" {...commonProps} />
                  </div>
                </div>
              </div>
            )}

            {/* ══ HABERLER ══════════════════════════════════════════════ */}
            {activeTab === 'news' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Haberler & <em>Duyurular</em></div>
                </div>
                <SettingInput label="Sayfa Başlık Resmi" settingKey="news_header_bg" type="image" {...commonProps} />
                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                      {isEditing ? ' Haberi Düzenle' : ' Yeni Haber Ekle'}
                    </div>
                    {/* YENİ: OTOMATİK ÇEVİRİ BUTONU */}
                    <button type="button" className="adm-btn adm-btn-ghost" onClick={handleTranslateNews} disabled={isTranslating} style={{fontSize: '0.75rem', height: '32px'}}>
                      <i className="fas fa-language"></i> {isTranslating ? 'Çevriliyor...' : 'TR -> EN Otomatik Çevir'}
                    </button>
                  </div>
                  <form onSubmit={e => saveItem(e, 'news', newsForm, setNewsForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Haber Başlığı (TR) *</label>
                        <input className="adm-input-full" placeholder="Başlık..." value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                      </div>
                      <div className="adm-form-item">
                        <label>Haber Başlığı (EN)</label>
                        <input className="adm-input-full" placeholder="Title..." value={newsForm.title_en} onChange={e => setNewsForm({...newsForm, title_en: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="adm-form-item">
                      <label>Tarih</label>
                      <input type="date" className="adm-input-full" value={newsForm.date || ''} onChange={e => setNewsForm({...newsForm, date: e.target.value})} style={{colorScheme:'dark', width: '50%'}} />
                    </div>
                    
                    <div className="adm-form-item">
                      <label>Görsel</label>
                      <FileInput value={newsForm.image_url} onChange={url => setNewsForm({...newsForm, image_url: url})} placeholder="Haber görseli..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Kısa Özet (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="2-3 cümle özet..." value={newsForm.summary} onChange={e => setNewsForm({...newsForm, summary: e.target.value})} rows={3} />
                        </div>
                        <div className="adm-form-item">
                          <label>Kısa Özet (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Short summary..." value={newsForm.summary_en} onChange={e => setNewsForm({...newsForm, summary_en: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Detaylı İçerik (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Haberin tam içeriği..." value={newsForm.description} onChange={e => setNewsForm({...newsForm, description: e.target.value})} rows={7} />
                        </div>
                        <div className="adm-form-item">
                          <label>Detaylı İçerik (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Full content..." value={newsForm.description_en} onChange={e => setNewsForm({...newsForm, description_en: e.target.value})} rows={7} />
                        </div>
                    </div>

                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Değişiklikleri Kaydet' : '+ Haber Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Haberler ({news.length})</div>
                  {news.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-newspaper" />Haber bulunamadı.</div>
                  ) : news.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info">
                        <strong>{item.title}</strong>
                        {item.date && <span><i className="far fa-calendar" style={{marginRight:'5px'}} />{item.date}</span>}
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'news')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Düzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('news', item.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ FAALİYETLER ═══════════════════════════════════════════ */}
            {activeTab === 'activities' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Faaliyetler & <em>Etkinlikler</em></div>
                </div>
                <SettingInput label="Sayfa Başlık Resmi" settingKey="activities_header_bg" type="image" {...commonProps} />
                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                      {isEditing ? ' Faaliyeti Düzenle' : ' Yeni Faaliyet Ekle'}
                    </div>
                    {/* YENİ: OTOMATİK ÇEVİRİ BUTONU */}
                    <button type="button" className="adm-btn adm-btn-ghost" onClick={handleTranslateActivities} disabled={isTranslating} style={{fontSize: '0.75rem', height: '32px'}}>
                      <i className="fas fa-language"></i> {isTranslating ? 'Çevriliyor...' : 'TR -> EN Otomatik Çevir'}
                    </button>
                  </div>
                  <form onSubmit={e => saveItem(e, 'activities', activityForm, setActivityForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Faaliyet Başlığı (TR) *</label>
                          <input className="adm-input-full" placeholder="Başlık..." value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} required />
                        </div>
                        <div className="adm-form-item">
                          <label>Faaliyet Başlığı (EN)</label>
                          <input className="adm-input-full" placeholder="Title..." value={activityForm.title_en} onChange={e => setActivityForm({...activityForm, title_en: e.target.value})} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Türü (TR)</label>
                        <input className="adm-input-full" placeholder="Toplantı..." value={activityForm.type} onChange={e => setActivityForm({...activityForm, type: e.target.value})} />
                      </div>
                      <div className="adm-form-item">
                        <label>Türü (EN)</label>
                        <input className="adm-input-full" placeholder="Meeting..." value={activityForm.type_en} onChange={e => setActivityForm({...activityForm, type_en: e.target.value})} />
                      </div>
                    </div>

                    <div className="adm-form-grid3">
                      <div className="adm-form-item">
                        <label>Konum (TR)</label>
                        <input className="adm-input-full" placeholder="İstanbul..." value={activityForm.location} onChange={e => setActivityForm({...activityForm, location: e.target.value})} />
                      </div>
                      <div className="adm-form-item">
                        <label>Konum (EN)</label>
                        <input className="adm-input-full" placeholder="Istanbul..." value={activityForm.location_en} onChange={e => setActivityForm({...activityForm, location_en: e.target.value})} />
                      </div>
                      <div className="adm-form-item">
                        <label>Tarih</label>
                        <input type="date" className="adm-input-full" value={activityForm.date} onChange={e => setActivityForm({...activityForm, date: e.target.value})} style={{colorScheme:'dark'}} />
                      </div>
                    </div>

                    <div className="adm-form-item">
                      <label>Görsel</label>
                      <FileInput value={activityForm.image_url} onChange={url => setActivityForm({...activityForm, image_url: url})} placeholder="Faaliyet görseli..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Kısa Özet (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Kısa açıklama..." value={activityForm.summary} onChange={e => setActivityForm({...activityForm, summary: e.target.value})} rows={3} />
                        </div>
                        <div className="adm-form-item">
                          <label>Kısa Özet (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Short summary..." value={activityForm.summary_en} onChange={e => setActivityForm({...activityForm, summary_en: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Detaylı Açıklama (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Detaylı..." value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} rows={6} />
                        </div>
                        <div className="adm-form-item">
                          <label>Detaylı Açıklama (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Detailed..." value={activityForm.description_en} onChange={e => setActivityForm({...activityForm, description_en: e.target.value})} rows={6} />
                        </div>
                    </div>

                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Değişiklikleri Kaydet' : '+ Faaliyet Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Faaliyetler ({activities.length})</div>
                  {activities.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-calendar" />Faaliyet bulunamadı.</div>
                  ) : activities.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info">
                        <strong>{item.title}</strong>
                        <span>
                          {item.date && <><i className="far fa-calendar" style={{marginRight:'5px'}} />{item.date} &bull; </>}
                          <span className="adm-badge adm-badge-blue">{item.type}</span>
                        </span>
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'activities')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Düzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('activities', item.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ ORTAKLAR ═════════════════════════════════════════════ */}
            {activeTab === 'partners' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Ortaklar & <em>Kurumlar</em></div>
                </div>
                <SettingInput label="Sayfa Başlığı" settingKey="partners_page_title" {...commonProps} />
                <SettingInput label="Başlık Resmi" settingKey="partners_header_bg" type="image" {...commonProps} />
                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className={isEditing ? 'fas fa-pen' : 'fas fa-plus'} />
                      {isEditing ? ' Ortak Düzenle' : ' Yeni Ortak Ekle'}
                    </div>
                    {/* YENİ: OTOMATİK ÇEVİRİ BUTONU */}
                    <button type="button" className="adm-btn adm-btn-ghost" onClick={handleTranslatePartners} disabled={isTranslating} style={{fontSize: '0.75rem', height: '32px'}}>
                      <i className="fas fa-language"></i> {isTranslating ? 'Çevriliyor...' : 'TR -> EN Otomatik Çevir'}
                    </button>
                  </div>
                  <form onSubmit={e => saveItem(e, 'partners', partnerForm, setPartnerForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Kurum Adı (TR) *</label>
                        <input className="adm-input-full" placeholder="Kurum adı..." value={partnerForm.name} onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} required />
                      </div>
                      <div className="adm-form-item">
                        <label>Kurum Adı (EN)</label>
                        <input className="adm-input-full" placeholder="Institution name..." value={partnerForm.name_en} onChange={e => setPartnerForm({...partnerForm, name_en: e.target.value})} />
                      </div>
                    </div>

                    <div className="adm-form-grid2">
                      <div className="adm-form-item">
                        <label>Ülke (TR) *</label>
                        <input className="adm-input-full" placeholder="Türkiye..." value={partnerForm.country} onChange={e => setPartnerForm({...partnerForm, country: e.target.value})} required />
                      </div>
                      <div className="adm-form-item">
                        <label>Ülke (EN)</label>
                        <input className="adm-input-full" placeholder="Turkey..." value={partnerForm.country_en} onChange={e => setPartnerForm({...partnerForm, country_en: e.target.value})} />
                      </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Rol (TR)</label>
                          <select className="adm-select-full" value={partnerForm.role} onChange={e => setPartnerForm({...partnerForm, role: e.target.value})}>
                            <option value="Ortak">Ortak</option>
                            <option value="Koordinatör">Koordinatör</option>
                          </select>
                        </div>
                        <div className="adm-form-item">
                          <label>Rol (EN)</label>
                          <select className="adm-select-full" value={partnerForm.role_en} onChange={e => setPartnerForm({...partnerForm, role_en: e.target.value})}>
                            <option value="">(Otomatik Çeviri Kullan)</option>
                            <option value="Partner">Partner</option>
                            <option value="Coordinator">Coordinator</option>
                          </select>
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Açıklama (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Kurum hakkında..." value={partnerForm.description} onChange={e => setPartnerForm({...partnerForm, description: e.target.value})} rows={4} />
                        </div>
                        <div className="adm-form-item">
                          <label>Açıklama (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="About the institution..." value={partnerForm.description_en} onChange={e => setPartnerForm({...partnerForm, description_en: e.target.value})} rows={4} />
                        </div>
                    </div>

                    <div className="adm-form-item">
                      <label>Web Sitesi</label>
                      <input className="adm-input-full" placeholder="https://..." value={partnerForm.website} onChange={e => setPartnerForm({...partnerForm, website: e.target.value})} />
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Kurum Logosu</label>
                          <FileInput value={partnerForm.image_url} onChange={url => setPartnerForm({...partnerForm, image_url: url})} placeholder="Logo URL..." uploadFile={uploadFile} showToast={showToast} />
                        </div>
                        <div className="adm-form-item">
                          <label>Ülke Bayrağı</label>
                          <FileInput value={partnerForm.flag_url} onChange={url => setPartnerForm({...partnerForm, flag_url: url})} placeholder="Bayrak URL..." uploadFile={uploadFile} showToast={showToast} />
                        </div>
                    </div>

                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Ortak Bilgilerini Güncelle' : '+ Ortak Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  <div style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>Mevcut Ortaklar ({partners.length})</div>
                  {partners.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-handshake" />Ortak bulunamadı.</div>
                  ) : partners.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info" style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        {item.image_url && <img src={item.image_url} style={{width:'40px', height:'28px', objectFit:'contain', borderRadius:'4px', border:'1px solid var(--border)', background:'white', padding:'2px'}} alt="" />}
                        <div>
                          <strong>{item.name}</strong>
                          <span>
                            <span className={`adm-badge ${item.role === 'Koordinatör' ? 'adm-badge-yellow' : 'adm-badge-green'}`}>{item.role}</span>
                            {' '}&bull; {item.country}
                          </span>
                        </div>
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'partners')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Düzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('partners', item.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ ÇIKTILAR ═════════════════════════════════════════════ */}
            {activeTab === 'results' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Proje <em>Çıktıları</em></div>
                </div>
                <SettingInput label="Sayfa Başlığı" settingKey="results_page_title" {...commonProps} />
                <SettingInput label="Başlık Resmi" settingKey="results_header_bg" type="image" {...commonProps} />
                <div className="adm-form-card">
                  <div className="adm-form-card-title">
                    <div>
                      <i className="fas fa-plus" /> {isEditing ? ' Çıktı Güncelle' : ' Yeni Çıktı Ekle'}
                    </div>
                    {/* YENİ: OTOMATİK ÇEVİRİ BUTONU */}
                    <button type="button" className="adm-btn adm-btn-ghost" onClick={handleTranslateResults} disabled={isTranslating} style={{fontSize: '0.75rem', height: '32px'}}>
                      <i className="fas fa-language"></i> {isTranslating ? 'Çevriliyor...' : 'TR -> EN Otomatik Çevir'}
                    </button>
                  </div>
                  <form onSubmit={e => saveItem(e, 'results', resultForm, setResultForm)} style={{display:'grid', gap:'14px'}}>
                    
                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Başlık (TR) *</label>
                          <input className="adm-input-full" placeholder="Çıktı başlığı..." value={resultForm.title} onChange={e => setResultForm({...resultForm, title: e.target.value})} required />
                        </div>
                        <div className="adm-form-item">
                          <label>Başlık (EN)</label>
                          <input className="adm-input-full" placeholder="Result title..." value={resultForm.title_en} onChange={e => setResultForm({...resultForm, title_en: e.target.value})} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Açıklama (TR)</label>
                          <textarea className="adm-textarea-full" placeholder="Açıklama..." value={resultForm.description} onChange={e => setResultForm({...resultForm, description: e.target.value})} rows={3} />
                        </div>
                        <div className="adm-form-item">
                          <label>Açıklama (EN)</label>
                          <textarea className="adm-textarea-full" placeholder="Description..." value={resultForm.description_en} onChange={e => setResultForm({...resultForm, description_en: e.target.value})} rows={3} />
                        </div>
                    </div>

                    <div className="adm-form-grid2">
                        <div className="adm-form-item">
                          <label>Durum (TR)</label>
                          <select className="adm-select-full" value={resultForm.status} onChange={e => setResultForm({...resultForm, status: e.target.value})}>
                            <option value="Planlanıyor">Planlanıyor</option>
                            <option value="Devam Ediyor">Devam Ediyor</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                          </select>
                        </div>
                        <div className="adm-form-item">
                          <label>Durum (EN)</label>
                          <select className="adm-select-full" value={resultForm.status_en} onChange={e => setResultForm({...resultForm, status_en: e.target.value})}>
                            <option value="Planned">Planned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                    </div>

                    <div className="adm-form-item">
                      <label>Dosya / Link</label>
                      <FileInput value={resultForm.link} onChange={url => setResultForm({...resultForm, link: url})} placeholder="Dosya yükleyin veya URL girin..." uploadFile={uploadFile} showToast={showToast} />
                    </div>
                    <button type="submit" className="adm-form-submit">
                      {isEditing ? 'Güncelle' : '+ Ekle'}
                    </button>
                  </form>
                </div>
                
                <div style={{marginTop:'24px'}}>
                  {results.length === 0 ? (
                    <div className="adm-empty"><i className="fas fa-file" />Çıktı bulunamadı.</div>
                  ) : results.map(item => (
                    <div key={item.id} className="adm-item-row">
                      <div className="adm-item-info">
                        <strong><i className="fas fa-file-circle-check" style={{color:'var(--accent)', marginRight:'8px'}} />{item.title}</strong>
                        <span>{item.status}</span>
                      </div>
                      <div className="adm-item-actions">
                        <button className="adm-btn adm-btn-ghost" onClick={() => startEdit(item, 'results')} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-pen" /> Düzenle
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => deleteItem('results', item.id)} style={{height:'32px', fontSize:'0.78rem'}}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ DİĞER SEKMLER (Değişiklik yok) ═════════════════════════ */}
            {activeTab === 'contact' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">İletişim <em>Bilgileri</em></div>
                </div>
                <SettingInput label="Sayfa Başlığı" settingKey="contact_page_title" {...commonProps} />
                <SettingInput label="Başlık Resmi" settingKey="contact_header_bg" type="image" {...commonProps} />
                <div style={{height:'8px'}} />
                <SettingInput label="E-posta Adresi" settingKey="contact_email" {...commonProps} />
                <SettingInput label="Telefon Numarası" settingKey="contact_phone" {...commonProps} />
                <SettingInput label="Adres" settingKey="contact_address" type="textarea" {...commonProps} />
              </div>
            )}

            {activeTab === 'site' && (
              <div className="adm-fade-in">
                <div className="adm-page-header">
                  <div className="adm-page-title">Site <em>Genel Ayarları</em></div>
                </div>

                <div className="adm-section">
                  <SectionHeader num="1" title="Üst Menü & Sekme (Header)" />
                  <SettingInput label="Favicon (Sekme İkonu)" settingKey="site_favicon" type="image" {...commonProps} />
                  <SettingInput label="Site Ana Logosu" settingKey="header_logo_image" type="image" {...commonProps} />
                  <SettingInput label="Logo Ana Metni" settingKey="header_logo_text" placeholder="DIGI-GREEN" {...commonProps} />
                  <SettingInput label="Logo Vurgu Metni" settingKey="header_logo_highlight" placeholder="FUTURE" {...commonProps} />
                </div>

                <div className="adm-section">
                  <SectionHeader num="2" title="Alt Bilgi (Footer)" />
                  <SettingInput label="AB Logosu / Bayrak" settingKey="footer_eu_logo" type="image" {...commonProps} />
                  <SettingInput label="Footer Hakkında Metni" settingKey="footer_desc" type="textarea" {...commonProps} />
                  <SettingInput label="2. Kolon Başlığı" settingKey="footer_column2_title" {...commonProps} />
                  <SettingInput label="3. Kolon Başlığı" settingKey="footer_column3_title" {...commonProps} />
                  <SettingInput label="AB Bilgilendirme Metni" settingKey="footer_disclaimer" type="textarea" {...commonProps} />
                </div>

                <div className="adm-section">
                  <SectionHeader num="3" title="Sosyal Medya" />
                  <SettingInput label="Facebook" settingKey="social_facebook" placeholder="https://facebook.com/..." {...commonProps} />
                  <SettingInput label="Twitter / X" settingKey="social_twitter" placeholder="https://twitter.com/..." {...commonProps} />
                  <SettingInput label="Instagram" settingKey="social_instagram" placeholder="https://instagram.com/..." {...commonProps} />
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}