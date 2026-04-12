import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import api from '../api';
import RestaurantCard from './RestaurantCard';

const AIRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classification, setClassification] = useState(null);

    useEffect(() => {
        fetchAIInsights();
    }, []);

    const fetchAIInsights = async () => {
        setLoading(true);
        try {
            // Fetch User Classification
            const classRes = await api.get('/api/ai/user-classification');
            setClassification(classRes.data);

            // Fetch Smart Recommendations
            const recRes = await api.get('/api/ai/smart-recommendations');
            setRecommendations(recRes.data);
        } catch (err) {
            console.error('AI Insight Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="animate-pulse flex flex-col gap-4 mb-12">
            <div className="h-10 w-64 bg-gray-100 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-50 rounded-xl"></div>)}
            </div>
        </div>
    );

    if (recommendations.length === 0) return null;

    return (
        <div style={{ marginBottom: '4rem' }}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div style={{ 
                        background: 'linear-gradient(135deg, #FF7E8B, #ed5a6b)', 
                        padding: '0.6rem', 
                        borderRadius: '0.8rem',
                        boxShadow: '0 4px 12px rgba(237, 90, 107, 0.3)'
                    }}>
                        <Sparkles size={24} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#1c1c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            AI Tailored For You
                        </h2>
                        {classification && (
                            <p style={{ color: '#666', fontSize: '0.95rem' }}>
                                Since you're a <span style={{ color: '#FF7E8B', fontWeight: 'bold' }}>{classification.classification}</span>, we thought you'd love these.
                            </p>
                        )}
                    </div>
                </div>
                <button 
                    onClick={fetchAIInsights}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        color: '#666', background: '#f5f5f5', border: 'none', 
                        padding: '0.5rem 1rem', borderRadius: '2rem', cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}
                >
                    <RefreshCw size={14} /> Refresh AI
                </button>
            </div>

            {classification && (
                <div style={{ 
                    background: 'linear-gradient(90deg, #fffafa, #fff)', 
                    border: '1px dashed #FF7E8B', 
                    borderRadius: '1rem', 
                    padding: '1.5rem', 
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Zap size={60} style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, color: '#FF7E8B' }} />
                    <h4 style={{ color: '#1c1c1c', fontWeight: '600', marginBottom: '0.5rem' }}>AI Insight ✨</h4>
                    <p style={{ color: '#4F4F4F', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {classification.description} {classification.recommendations}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recommendations.map(rest => (
                    <RestaurantCard key={rest.id} restaurant={rest} />
                ))}
            </div>
        </div>
    );
};

export default AIRecommendations;
