import { Link } from "wouter";
import { Button } from "../components/ui";
export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <p className="label">404</p>
      <h1 className="serif mt-2 text-4xl text-forest">A quiet corner.</h1>
      <p className="mt-3 text-mute">That path is not in the nursery.</p>
      <Link href="/" className="mt-6 inline-block"><Button>Back to today</Button></Link>
    </div>
  );
}
