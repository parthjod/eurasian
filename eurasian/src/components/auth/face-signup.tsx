"use client";
import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FaceSignupPage() {
  const cam = useRef<Webcam>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

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
    await fetch('/api/signup/face', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, descriptor })
    });
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      {ready && <Webcam ref={cam} screenshotFormat="image/png" className="w-full" />}
      <Button onClick={capture}>Capture & Sign up</Button>
    </div>
  );
}
