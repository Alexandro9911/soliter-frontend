import useSound from 'use-sound';
import { useEffect, useState } from 'react';
// @ts-ignore
import EventBus from "@/shared/EventBus/EventBus";
import SoundPlay from '@/assets/sounds/ball-sound.mp3';

export default function SoundPlayer() {

  const [playEnterStream] = useSound(

      SoundPlay,
    {
      volume: 1
    }
  );

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    eventBus.on(
      'BALL_PASTE',
      playEnterStream
    );

    return () => {
      const eventBus = EventBus.getInstance();
      eventBus.off('BALL_PASTE');
    };
  });

  return <div></div>;
}
