import React, { useState } from 'react';

const faqs = [
  {
    q: 'How do I find and hire a laborer?',
    a: (
      <>
        You can find and hire a laborer by browsing the popular categories on the home page or using the search bar to look for a specific skill (e.g., electrician, plumber). Click on "View Profile" to see a laborer’s details, ratings, and reviews. You can then contact the laborer directly via phone or WhatsApp, or post a job and wait for laborers to apply.
      </>
    ),
  },
  {
    q: 'How do I post a job?',
    a: (
      <>
        Click on the <b>"Post Your Work"</b> button on the home page or in the navigation bar. Fill out the job details, including title, description, location, category, and budget (optional). You can also upload a reference photo. Once submitted, your job will be visible to all relevant laborers who can then contact you or apply for the job.
      </>
    ),
  },
  {
    q: 'How do I report abuse or fraud?',
    a: (
      <>
        If you encounter suspicious activity, fake profiles, or abusive behavior, scroll down to the <b>"Report Abuse or Fraud"</b> section on this page. Fill out the form with details of the incident and submit it. Our team will review your report and take appropriate action. You can also email us at <a href="mailto:support@labourconnect.com">support@labourconnect.com</a>.
      </>
    ),
  },
  {
    q: 'How do I reset my password?',
    a: (
      <>
        Go to the <b>Login</b> page and click on <b>"Login with OTP"</b> or use the <b>Forgot Password</b> option. Enter your registered email or phone number to receive an OTP. Enter the OTP to verify your identity and set a new password.
      </>
    ),
  },
  {
    q: 'How do I contact support?',
    a: (
      <>
        You can contact our support team by emailing <a href="mailto:support@labourconnect.com">support@labourconnect.com</a> or using the WhatsApp chat link in the <b>Contact Support</b> section below. We are here to help with any technical, safety, or account issues.
      </>
    ),
  },
];

const HelpPage = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const handleToggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-primary fw-bold">Help & Support</h2>

      {/* FAQs */}
      <section className="mb-5">
        <h4 className="mb-3">Frequently Asked Questions</h4>
        <div className="accordion" id="faqAccordion">
          {faqs.map((faq, idx) => (
            <div className="accordion-item" key={idx}>
              <h2 className="accordion-header" id={`faqHeading${idx}`}>
                <button
                  className={`accordion-button${openIdx === idx ? '' : ' collapsed'}`}
                  type="button"
                  style={{ cursor: 'pointer' }}
                  aria-expanded={openIdx === idx ? 'true' : 'false'}
                  aria-controls={`faqCollapse${idx}`}
                  onClick={() => handleToggle(idx)}
                >
                  {faq.q}
                </button>
              </h2>
              <div
                id={`faqCollapse${idx}`}
                className={`accordion-collapse collapse${openIdx === idx ? ' show' : ''}`}
                aria-labelledby={`faqHeading${idx}`}
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Report Abuse/Fraud */}
      <section className="mb-5">
        <h4 className="mb-3">Report Abuse or Fraud</h4>
        <p>If you encounter suspicious activity, fake profiles, or abuse, please let us know. We take user safety seriously.</p>
        <form className="card p-3 shadow-sm" style={{ maxWidth: 500 }}>
          <div className="mb-3">
            <label className="form-label">Describe the issue</label>
            <textarea className="form-control" rows={3} placeholder="Describe the abuse or fraud..." required></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Your Email (optional)</label>
            <input type="email" className="form-control" placeholder="you@example.com" />
          </div>
          <button type="submit" className="btn btn-danger">Report</button>
        </form>
      </section>

      {/* Technical Help */}
      <section className="mb-5">
        <h4 className="mb-3">Technical Help</h4>
        <ul>
          <li>For login or registration issues, try clearing your browser cache and cookies.</li>
          <li>If you face technical errors, try reloading the page or using a different browser.</li>
          <li>For persistent issues, contact our support team below.</li>
        </ul>
      </section>

      {/* Guides */}
      <section className="mb-5">
        <h4 className="mb-3">User Guides</h4>
        <ul>
          <li><b>How to Post a Job:</b> Go to "Post Your Work", fill in details, and submit.</li>
          <li><b>How to Become a Laborer:</b> Sign up as a laborer and complete your profile.</li>
          <li><b>How to Review a Laborer:</b> After job completion, go to the laborer’s profile and leave a review.</li>
        </ul>
      </section>

      {/* Policies */}
      <section className="mb-5">
        <h4 className="mb-3">Policies</h4>
        <ul>
          <li><b>Privacy Policy:</b> We do not share your personal information with third parties without consent.</li>
          <li><b>Terms of Service:</b> By using Labour Connect, you agree to our terms and community guidelines.</li>
          <li><b>Zero Tolerance for Fraud:</b> Any fraudulent activity will result in account suspension and legal action.</li>
        </ul>
      </section>

      {/* Contact Support */}
      <section>
        <h4 className="mb-3">Contact Support</h4>
        <ul className="list-unstyled">
          <li><b>Email:</b> <a href="mailto:support@labourconnect.com">support@labourconnect.com</a></li>
          <li><b>Phone:</b> XXXXXXX</li>
          <li><b>WhatsApp:</b> <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></li>
        </ul>
      </section>
    </div>
  );
};

export default HelpPage; 