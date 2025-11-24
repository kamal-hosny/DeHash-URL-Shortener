import {
  Phone,
  Mail,
  MapPin,
  Twitter,
  Instagram,
  Gamepad2,
  Send,
  Sparkles,
} from "lucide-react";
import ContactForm from "./contact-form";

const ContactPage = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center py-20 px-4 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)] -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)] -z-10" />

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Header Section */}
      <div className="text-center mb-16 space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Get in Touch</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have a question or want to work together? We&apos;d love to hear from
          you. Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT SIDE - Contact Information */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground rounded-2xl p-8 md:p-10 shadow-2xl border border-primary/20 relative overflow-hidden">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl" />
              </div>

              <div className="relative z-10 space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
                    Contact Information
                    <Send className="w-6 h-6" />
                  </h2>
                  <p className="text-primary-foreground/80 text-sm">
                    Fill out the form and our team will get back to you within
                    24 hours.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex items-start gap-4 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-foreground/70 mb-1">
                        Phone
                      </p>
                      <p className="font-medium">+1012 3456 789</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-foreground/70 mb-1">
                        Email
                      </p>
                      <p className="font-medium">demo@gmail.com</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-foreground/70 mb-1">
                        Address
                      </p>
                      <p className="font-medium leading-relaxed">
                        132 Dartmouth Street Boston,
                        <br />
                        Massachusetts 02156
                        <br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Icons */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-sm text-primary-foreground/70 mb-4">
                    Connect with us
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white hover:text-primary flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg">
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white hover:text-primary flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg">
                      <Instagram className="w-5 h-5" />
                    </button>
                    <button className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white hover:text-primary flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg">
                      <Gamepad2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-xl">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Send us a message</h3>
                <p className="text-muted-foreground">
                  We&apos;re here to help and answer any question you might have
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
