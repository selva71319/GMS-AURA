/* ═══════════════════════════════════════════════════════════
   GMS AURA — Premium AI-Driven Digital Agency @2026
   ═══════════════════════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');
const { initDB } = require('./db/init');

const app = express();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Supabase (Optional)
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY) 
  : null;
const PORT = process.env.PORT || 3000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve Static Files ───
app.use(express.static(path.join(__dirname, 'public')));

// ─── Initialize Database ───
const db = initDB();

// ═══════════════════════ API ROUTES ═══════════════════════

// ── Contact Form Submission ──
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, service, budget, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    // 1. Save to local JSON DB
    const newItem = db.insert('contacts', { name, email, phone, service, budget, message, status: 'new', created_at: new Date().toISOString() });

    // 2. Sync to Supabase (if configured)
    if (supabase) {
      await supabase.from('contacts').insert([{ name, email, phone, service, budget, message }]);
    }

    // 3. Send Email Notification via Resend
    if (resend) {
      const ownerEmail = process.env.NOTIFICATION_EMAIL || 'selva@gmsaura.com';
      await resend.emails.send({
        from: 'GMS AURA <onboarding@resend.dev>',
        to: ownerEmail,
        subject: `New Lead: ${name} - ${service}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Thank you! We\'ll get back to you within 2 hours.',
      id: newItem.id
    });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
  }
});

// ── Newsletter Subscription ──
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });

    const existing = db.getOne('newsletter', n => n.email === email);
    if (existing) return res.json({ success: true, message: 'Already subscribed!' });

    // 1. Local DB
    db.insert('newsletter', { email, subscribed_at: new Date().toISOString() });

    // 2. Supabase Sync
    if (supabase) {
      await supabase.from('newsletter').insert([{ email }]);
    }

    res.json({ success: true, message: 'Welcome! You\'re subscribed.' });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ── Get testimonials ──
app.get('/api/testimonials', (req, res) => {
  try {
    const data = db.getAll('testimonials').filter(t => t.active).sort((a,b) => a.display_order - b.display_order);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ── Get Blog Posts ──
app.get('/api/blog', (req, res) => {
  try {
    const data = db.getAll('blog_posts').filter(p => p.published).sort((a,b) => new Date(b.published_at) - new Date(a.published_at));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ── Get Single Post ──
app.get('/api/blog/:slug', (req, res) => {
  try {
    const post = db.getOne('blog_posts', p => p.slug === req.params.slug && p.published);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ═══════════════ HTML PAGE ROUTES ═══════════════
const pages = ['services', 'showcase', 'about', 'testimonials', 'contact', 'blog'];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
});

app.get('/blog/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog-post.html'));
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`\n  ◆ GMS AURA Server`);
  console.log(`  ─────────────────────────`);
  console.log(`  → Running at: http://localhost:${PORT}`);
  console.log(`  → API ready at: http://localhost:${PORT}/api`);
  console.log(`  → Press Ctrl+C to stop\n`);
});
