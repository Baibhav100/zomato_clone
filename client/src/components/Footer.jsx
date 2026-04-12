import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ background: '#F8F8F8', padding: '3rem 0', marginTop: '4rem', borderTop: '1px solid #E8E8E8' }}>
            <div className="container">
                <header className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.1rem' }}>otamaz</div>
                    <div className="flex gap-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #B5B5B5', borderRadius: '0.4rem', padding: '0.4rem 1rem', fontSize: '1rem', fontWeight: '500', background: 'white' }}>
                            <Globe size={18} /> India <ChevronDown size={14} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #B5B5B5', borderRadius: '0.4rem', padding: '0.4rem 1rem', fontSize: '1rem', fontWeight: '500', background: 'white' }}>
                            <Globe size={18} /> English <ChevronDown size={14} />
                        </div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2rem' }}>
                    <FooterColumn title="About Zomato" links={['Who We Are', 'Blog', 'Work With Us', 'Investor Relations', 'Report Fraud', 'Press Kit', 'Contact Us']} />
                    <FooterColumn title="Zomaverse" links={['Zomato', 'Blinkit', 'Feeding India', 'Hyperpure', 'Zomato Live', 'Zomaland', 'Weather Union']} />
                    <FooterColumn title="For Restaurants" links={['Partner With Us', 'Apps For You']} />
                    <FooterColumn title="Learn More" links={['Privacy', 'Security', 'Terms', 'Sitemap']} />
                    
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1.2rem', letterSpacing: '2px' }}>Social Links</h4>
                        <div className="flex gap-2" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ width: '28px', height: '28px', background: '#1c1c1c', borderRadius: '50%' }}></div>
                            <div style={{ width: '28px', height: '28px', background: '#1c1c1c', borderRadius: '50%' }}></div>
                            <div style={{ width: '28px', height: '28px', background: '#1c1c1c', borderRadius: '50%' }}></div>
                            <div style={{ width: '28px', height: '28px', background: '#1c1c1c', borderRadius: '50%' }}></div>
                            <div style={{ width: '28px', height: '28px', background: '#1c1c1c', borderRadius: '50%' }}></div>
                        </div>
                        <div className="flex flex-col gap-3">
                             <img src="https://b.zmtcdn.com/data/webuikit/23e930757c3df49840c482a8638ff5c31556001144.png" style={{ width: '137px', cursor: 'pointer' }} />
                             <img src="https://b.zmtcdn.com/data/webuikit/9f0c85a5e3341408accbc56ad30a24cd1556001122.png" style={{ width: '137px', cursor: 'pointer' }} />
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #B5B5B5', marginTop: '3rem', paddingTop: '1.5rem', fontSize: '0.86rem', color: '#4F4F4F', lineHeight: '1.5' }}>
                    By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2008-2024 © Zomato™ Ltd. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

const FooterColumn = ({ title, links }) => (
    <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1.2rem', letterSpacing: '2px' }}>{title}</h4>
        <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: '#696969', lineHeight: '2' }}>
            {links.map((link, i) => (
                <li key={i} className="hover-scale" style={{ cursor: 'pointer', transition: '0.2s' }}>{link}</li>
            ))}
        </ul>
    </div>
);

const SocialIcon = ({ icon }) => (
    <div style={{ 
        width: '28px', 
        height: '28px', 
        background: '#1c1c1c', 
        color: 'white', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer'
    }}>
        {icon}
    </div>
);

export default Footer;
