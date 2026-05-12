import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#a78bfa',
          },
          elements: {
            card: 'bg-card border border-border shadow-xl',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButton: 'border-border',
          },
        }}
      />
    </div>
  );
}
