'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  MessageSquare, 
  Building2, 
  ArrowLeft,
  Twitter,
  Github
} from 'lucide-react';
import { PartnerWithUsSection } from '@/components/public/partner-with-us-section';
import publicAPI from '@/lib/api-public';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function ContactUsPage() {
  const [formData, setFormData] = React.useState({
    full_name: '',
    email: '',
    institution: '',
    topic: 'General Inquiry',
    message: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!executeRecaptcha) {
      setStatus({
        type: 'error',
        message: 'Security validation is not ready. Please refresh the page.'
      });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: null });

    try {
      // Execute reCAPTCHA v3 to get token
      const token = await executeRecaptcha('contact_form');
      
      if (!token) {
        setStatus({
          type: 'error',
          message: 'Security validation failed. Please try again or refresh the page.'
        });
        setLoading(false);
        return;
      }

      const requestData = {
        ...formData,
        topic: formData.topic as any,
        recaptcha_token: token
      };

      // console.log('Sending contact form data:', requestData);

      const response = await publicAPI.contact.send(requestData);
      
      // console.log('Contact API Response:', response);
      
      const success = (response.data as any)?.success;
      const message = (response.data as any)?.message;

      if (success) {
        setStatus({
          type: 'success',
          message: message || 'Thank you! Your message has been sent successfully.'
        });
        setFormData({
          full_name: '',
          email: '',
          institution: '',
          topic: 'General Inquiry',
          message: ''
        });
      } else {
        let errorMsg = message || 'Failed to send message. Please try again later.';
        
        if (response.status === 429) {
          errorMsg = 'Too many requests. Please try again in an hour.';
        } else if (response.status === 422) {
          // Extract FastAPI validation error details
          const details = (response.error as any)?.detail;
          if (Array.isArray(details) && details.length > 0) {
            errorMsg = `Validation error: ${details.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ')}`;
          } else {
            errorMsg = 'Invalid data submitted. Please check your form entries.';
          }
        }

        setStatus({
          type: 'error',
          message: errorMsg
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Large flowing background blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-teal-500/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-soft-light animate-pulse duration-7000"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-soft-light"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] bg-teal-500/5 rounded-[100%] blur-[120px] rotate-12"></div>
      </div>

      <main className="relative z-10">
        {/* Soft Hero Section Background */}
        <div className="absolute top-0 left-0 w-full h-[35rem] bg-teal-500/[0.03] -z-10 [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"></div>
        
        <div className="container mx-auto px-6 pt-32 pb-24">
          {/* Header Section */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-teal-600 transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="font-heading text-4xl md:text-6xl tracking-tight mb-6">
              Get in Touch with our <br />
              <span className="text-teal-600 dark:text-teal-400">Ecosystem Experts</span>
            </h1>
            <p className="text-xl text-muted-foreground font-body leading-relaxed">
              Whether you're looking for institutional partnerships, pilot programs, or student support, we're here to help you scale your educational impact.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto relative">
          {/* Subtle glow behind the main content area */}
          <div className="absolute inset-x-[-5%] inset-y-[-5%] bg-teal-500/[0.02] rounded-[48px] -z-10 blur-3xl"></div>
          
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-teal-500/10 transition-colors"></div>
              <h3 className="font-heading text-2xl mb-8 relative">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-1">Email Us</h4>
                    <p className="text-lg font-medium">support@exampapel.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-1">Partnerships</h4>
                    <p className="text-lg font-medium">partners@exampapel.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-coral-500/10 flex items-center justify-center text-coral-600 shrink-0">
                    <Twitter className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-1">Follow Us</h4>
                    <p className="text-lg font-medium">@exampapel_hq</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-border/50">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-6">Connect with us</h4>
                <div className="flex gap-4">
                   <Button variant="outline" size="icon" className="rounded-xl hover:bg-teal-500/10 transition-colors">
                     <Twitter className="w-5 h-5" />
                   </Button>
                   <Button variant="outline" size="icon" className="rounded-xl hover:bg-teal-500/10 transition-colors">
                     <Github className="w-5 h-5" />
                   </Button>
                </div>
              </div>
            </div>

            {/* Support Hours Card */}
            <div className="bg-teal-600 p-8 rounded-3xl text-white shadow-xl shadow-teal-500/20">
              <MessageSquare className="w-10 h-10 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Technical Support</h3>
              <p className="opacity-90 leading-relaxed text-sm">
                Our technical team is available Monday through Friday, 9:00 AM - 6:00 PM (EAT). We typically respond within 24 hours.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
               {/* Accent decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <h2 className="text-3xl font-heading mb-8">Send us a Message</h2>
              
              {status.type && (
                <div className={`mb-8 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  status.type === 'success' 
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Full Name</label>
                    <Input 
                      placeholder="Enter your name" 
                      className="rounded-xl h-12 bg-muted/30 border-border focus:ring-2 focus:ring-teal-500 transition-all font-body"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Work Email</label>
                    <Input 
                      type="email" 
                      placeholder="you@institution.edu" 
                      className="rounded-xl h-12 bg-muted/30 border-border focus:ring-2 focus:ring-teal-500 transition-all font-body"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Institution / Organization</label>
                    <Input 
                      placeholder="e.g. University of Nairobi" 
                      className="rounded-xl h-12 bg-muted/30 border-border focus:ring-2 focus:ring-teal-500 transition-all font-body"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Topic</label>
                    <select 
                      className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-all font-body disabled:opacity-50"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      disabled={loading}
                    >
                      <option value="Strategic Partnership">Strategic Partnership</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Sales">Sales</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium ml-1">Your Message</label>
                  <Textarea 
                    placeholder="Tell us about your requirements..." 
                    className="min-h-[160px] rounded-xl bg-muted/30 border-border focus:ring-2 focus:ring-teal-500 transition-all font-body resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-14 text-lg font-semibold shadow-lg shadow-teal-500/20 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground mt-4 font-body">
                  By submitting this form, you agree to our Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <PartnerWithUsSection />
    </main>
    </div>
  );
}
