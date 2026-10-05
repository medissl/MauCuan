import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { supabase, AUTH_REDIRECT } from '../lib/supabase';
import { Button, Card, Field, Header, LinkButton, Miko, type } from './ui';
type Mode = 'welcome' | 'signin' | 'signup' | 'verify' | 'forgot' | 'recovery';
export function Auth({ onError }: { onError: (message: string) => void }) {
  const [mode, setMode] = useState<Mode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const busyRef = useRef(false);
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(n => Math.max(0,n-1)),1000); return () => clearTimeout(timer); }, [cooldown]);
  const move = (m: Mode) => { setMode(m); setToken(''); setNotice(''); onError(''); };
  async function submit(action: 'signin' | 'signup' | 'reset' | 'verify' | 'resend' | 'recover') {
    if(busyRef.current || (cooldown && ['resend','reset'].includes(action))) return;
    busyRef.current = true; setBusy(true); setNotice(''); onError('');
    try {
      const address = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Masukkan alamat email yang valid.');
      if (['signin', 'signup'].includes(action) && password.length < (action === 'signup' ? 10 : 1)) throw new Error('Gunakan kata sandi minimal 10 karakter.');
      if (['verify','recover'].includes(action) && !/^\d{6,8}$/.test(token.trim())) throw new Error('Masukkan kode lengkap dari email.');
      if (action === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: address, password, options: { emailRedirectTo: AUTH_REDIRECT } });
        if (error) throw error; setPassword('');
        if (!data.session) { setMode('verify'); setToken(''); setCooldown(60); setNotice('Kode verifikasi dikirim. Cek kotak masuk atau spam, lalu masukkan kode di sini.'); }
      } else if (action === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: address, password }); if (error?.code === 'email_not_confirmed') { setMode('verify'); setNotice('Email belum terverifikasi. Masukkan kode terakhir atau kirim ulang.'); return; } if (error) throw error; setPassword('');
      } else if (action === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(address, { redirectTo: AUTH_REDIRECT }); if (error) throw error;
        setMode('recovery'); setToken(''); setCooldown(60); setNotice('Jika email terdaftar, kode pemulihan akan dikirim.');
      } else if (action === 'resend') {
        const { error } = await supabase.auth.resend({ type: 'signup', email: address, options: { emailRedirectTo: AUTH_REDIRECT } }); if (error) throw error;
        setToken(''); setCooldown(60); setNotice('Kode baru dikirim. Gunakan kode dari email terbaru.');
      } else {
        const { error } = await supabase.auth.verifyOtp({ email: address, token: token.trim(), type: action === 'recover' ? 'recovery' : 'email' }); if (error) throw error;
      }
    } catch (e) { onError(e instanceof Error ? e.message : String((e as { message?: string })?.message || 'Tidak berhasil. Coba lagi.')); }
    finally { busyRef.current = false; setBusy(false); }
  }
  if (mode === 'welcome') return <><View style={{ alignItems: 'center' }}><Miko size={250} /></View><Text style={[type.title, { fontSize: 35, lineHeight: 44 }]}>Uang tertata.{ '\n' }Macan bahagia.</Text><Text style={type.body}>Catat dengan mudah. Bangun kebiasaan baik bersama teman kecilmu.</Text><Card><Text style={type.heading}>Sedikit setiap hari. Besar nanti.</Text><Text style={type.body}>Kenali pengeluaran, tumbuhkan tabungan, dan temui Miko.</Text></Card><Button text="Buat akun MauCuan" onPress={() => move('signup')} /><Button text="Sudah punya akun? Masuk" secondary onPress={() => move('signin')} /></>;
  return <><Header title={{ signin: 'Selamat datang lagi', signup: 'Mulai perjalananmu', verify: 'Masukkan kode email', forgot: 'Lupa kata sandi?', recovery: 'Pulihkan akunmu' }[mode]} onBack={() => move('welcome')} /><View style={{ alignItems: 'center' }}><Miko size={mode === 'verify' ? 190 : 140} /></View><Field label="EMAIL" email value={email} onChangeText={setEmail} placeholder="nama@email.com" />{['signin', 'signup'].includes(mode) && <Field label="KATA SANDI" secure value={password} onChangeText={setPassword} placeholder={mode === 'signup' ? 'Minimal 10 karakter' : 'Kata sandimu'} />}{notice ? <Card tone="pale"><Text style={type.body}>{notice}</Text></Card> : null}{mode === 'signup' && <Card tone="pale"><Text style={type.heading}>Datamu milikmu.</Text><Text style={type.body}>Catatan hanya dapat diakses melalui akunmu. Tidak perlu menghubungkan rekening.</Text></Card>}{['signin', 'signup'].includes(mode) && <Button disabled={busy} text={busy ? 'Sebentar…' : mode === 'signin' ? 'Masuk' : 'Buat akun'} onPress={() => void submit(mode === 'signin' ? 'signin' : 'signup')} />}{mode === 'signin' && <LinkButton text="Lupa kata sandi?" onPress={() => move('forgot')} />}{mode === 'forgot' && <Button disabled={busy} text="Kirim kode pemulihan" onPress={() => void submit('reset')} />}{(mode === 'verify' || mode === 'recovery') && <><Text style={type.body}>Masukkan kode dari email untuk melanjutkan.</Text><Field label="Kode verifikasi" code value={token} onChangeText={setToken} placeholder="Kode verifikasi" /><Button disabled={busy || token.length < 6} text={busy ? 'Memverifikasi…' : 'Verifikasi kode'} onPress={() => void submit(mode === 'verify' ? 'verify' : 'recover')} /><Button disabled={busy || cooldown > 0} text={cooldown ? `Kirim ulang dalam ${cooldown} detik` : 'Kirim ulang kode'} secondary onPress={() => void submit(mode === 'verify' ? 'resend' : 'reset')} /></>}<LinkButton text={mode === 'signin' ? 'Belum punya akun? Daftar' : 'Kembali ke masuk'} onPress={() => move(mode === 'signin' ? 'signup' : 'signin')} /></>;
}
