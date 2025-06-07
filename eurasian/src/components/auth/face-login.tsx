"use client";
import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function FaceLoginPage() {
  const cam = useRef<Webcam>(null);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await faceapi.nets.ssdMobilenetv1.load('/models');
      await faceapi.nets.faceLandmark68Net.load('/models');
      await faceapi.nets.faceRecognitionNet.load('/models');
      setReady(true);
    })();
  }, []);

  const capture = async () => {
    const shot = cam.current?.getScreenshot();
    if (!shot) return;
    const img = await faceapi.fetchImage(shot);
    const descriptor = await faceapi.computeFaceDescriptor(img);

    const res = await fetch('/api/login/face', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descriptor })
    });
    const data = await res.json();
    if (res.ok) {
      // store JWT or rely on cookie
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } else {
      setMsg(data.error);
    }
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {ready && <Webcam ref={cam} screenshotFormat="image/png" className="w-full" />}
      <Button onClick={capture}>Capture & Login</Button>
      <p className="text-center text-sm">{msg}</p>
    </div>
  );
}
