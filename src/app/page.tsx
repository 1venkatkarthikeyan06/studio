import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Logo } from '@/components/logo'
import Link from 'next/link'

export default function AuthenticationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="flex justify-center items-center gap-4 mb-4">
        <Logo className="w-12 h-12 text-primary" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          AI Interview Bot
        </h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center mb-8">
        Practice for your next interview and get instant, private feedback.
      </p>

      <Tabs defaultValue="sign-in" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input id="password-signin" type="password" required />
              </div>
            </CardContent>
            <CardHeader>
              <Button asChild>
                <Link href="/interview">Sign In</Link>
              </Button>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create a new account to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-signup">Name</Label>
                <Input id="name-signup" type="text" placeholder="Your Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input id="password-signup" type="password" required />
              </div>
            </CardContent>
            <CardHeader>
              <Button asChild>
                <Link href="/interview">Sign Up</Link>
              </Button>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
      <footer className="w-full max-w-5xl mt-16 text-center text-sm text-muted-foreground absolute bottom-8">
        <p>
          &copy; {new Date().getFullYear()} AI Interview Bot. All rights
          reserved.
        </p>
      </footer>
    </div>
  )
}
