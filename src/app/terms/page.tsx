import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Terms of Service</h1>
        <p className="text-lg text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <Card className="bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Welcome to PlayNite ("we," "us," or "our"). By accessing or using our video streaming platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service.
          </p>
          <p>
            This is a sample Terms of Service document. In a real application, you should consult with a legal professional to draft a comprehensive and legally binding agreement.
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle>2. User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            To access certain features of the Service, you must create an account. You are responsible for safeguarding your account password and for any activities or actions under your password. We are not liable for any loss or damage arising from your failure to comply with this security obligation.
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle>3. User Conduct and Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            You are solely responsible for the content you upload, post, or otherwise transmit via the Service. You agree not to upload content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.
          </p>
           <p>
            We reserve the right, but are not obligated, to remove or disable access to any content for any reason, including content that we believe violates these Terms.
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle>4. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranty that the Service will meet your requirements or be available on an uninterrupted, secure, or error-free basis. Your use of the Service is at your own risk.
          </p>
        </CardContent>
      </Card>
      
        <Card className="bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle>5. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
