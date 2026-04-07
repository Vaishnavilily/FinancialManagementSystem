import { Rocket } from "lucide-react";
import "./ComingSoon.css";

export default function ComingSoon({ title, description, icon: Icon = Rocket }) {
  return (
    <div className="coming-soon-container">
      <div className="feature-icon-wrapper">
        <Icon size={56} color="var(--color-primary)" />
      </div>
      
      <div className="coming-soon-content">
        <h1>{title}</h1>
        <p>
          {description || "We are working hard to bring this feature to life. It will be available in an upcoming release. Enter your email to get notified when it goes live!"}
        </p>

        <form className="notify-form" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="notify-input" 
          />
          <button type="submit" className="wave-btn-primary">
            Notify Me
          </button>
        </form>
      </div>
    </div>
  );
}
