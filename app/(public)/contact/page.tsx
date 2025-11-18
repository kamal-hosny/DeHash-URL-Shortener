

import {
  Phone,
  Mail,
  MapPin,
  Twitter,
  Instagram,
  Gamepad2,
} from "lucide-react";
import ContactForm from "./contact-form";

const ContactPage = () => {
 

  return (
    <div className="w-full flex flex-col items-center py-16 px-4 bg-muted">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground">
          Any question or remarks? Just write us a message!
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-card shadow-xl rounded-xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* LEFT SIDE */}
        <div className="bg-primary text-primary-foreground rounded-xl p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Contact Information</h2>
            <p className="text-muted-foreground mb-10">
              Say something to start a live chat!
            </p>

            <div className="space-y-6">

              {/* Phone */}
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5" />
                <p>+1012 3456 789</p>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5" />
                <p>demo@gmail.com</p>
              </div>

              {/* Address */}
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5" />
                <p>
                  132 Dartmouth Street Boston,
                  <br /> Massachusetts 02156 United States
                </p>
              </div>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-10">
            <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-muted">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-muted">
              <Instagram className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-muted">
              <Gamepad2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <ContactForm />

      </div>
    </div>
  );
};

export default ContactPage;
