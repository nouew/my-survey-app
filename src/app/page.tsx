
import { MainApp } from '@/components/main-app';

export default async function Home() {
  // Directly render the main application without any authentication checks.
  return <MainApp username="local_user" />;
}
