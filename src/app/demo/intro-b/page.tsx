import { Metadata } from 'next';
import IntroBClient from './IntroBClient';

export const metadata: Metadata = {
  title: 'CB Media — Event Horizon Intro Demo',
  robots: 'noindex',
};

export default function IntroBDemo() {
  return <IntroBClient />;
}
