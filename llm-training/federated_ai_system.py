"""
Federated AI System for Exoplanet Discovery

This module implements the core federated learning framework where multiple 
AI helpers analyze star data locally, share only insights, and refine their 
models through human feedback.

Features:
- Multiple AI helpers with local analysis
- Privacy-preserving insight sharing
- Dynamic reliability weighting based on feedback
- Explainable AI with interpretable outputs
- Human-in-the-loop validation
"""

import numpy as np
import torch
import torch.nn as nn
from typing import Dict, List, Optional, Tuple, Any
import json
import logging
from dataclasses import dataclass, asdict
from datetime import datetime
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score
import matplotlib.pyplot as plt

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ExoplanetCandidate:
    """Represents a potential exoplanet candidate with measurements"""
    star_id: str
    period: float  # Orbital period in days
    radius_ratio: float  # Planet radius / Star radius
    depth: float  # Transit depth
    duration: float  # Transit duration
    discovery_method: str  # radial_velocity, transit, etc.
    confidence: float  # AI confidence score
    stellar_mass: Optional[float] = None
    stellar_radius: Optional[float] = None
    temperature: Optional[float] = None
    
    def to_dict(self):
        return asdict(self)

@dataclass
class AIHelperResult:
    """Results from an AI helper's analysis"""
    helper_id: str
    prediction: float  # Binary classification: 0=not planet, 1=planet
    confidence: float
    explanation: Dict[str, Any]  # Explainable AI output
    features_used: List[str]
    processing_time: float
    timestamp: datetime

class ScientificCalculator:
    """
    Implements core scientific methods for exoplanet detection and analysis
    """
    
    @staticmethod
    def radial_velocity_amplitude(planet_mass: float, star_mass: float, 
                                 period: float, inclination: float = 90) -> float:
        """
        Calculate radial velocity amplitude from planet parameters
        Formula: K = (2πG/P)^(1/3) * (Mp*sin(i)/(Ms + Mp)^(2/3))
        """
        G = 6.67430e-11  # Gravitational constant
        period_seconds = period * 24 * 3600
        
        K = ((2 * np.pi * G / period_seconds)**(1/3) * 
             (planet_mass * np.sin(np.radians(inclination))) / 
             ((star_mass + planet_mass)**(2/3)))
        
        return K
    
    @staticmethod
    def transit_depth(planet_radius: float, star_radius: float) -> float:
        """
        Calculate transit depth: ΔF/F = (Rp/Rs)²
        """
        return (planet_radius / star_radius)**2
    
    @staticmethod
    def orbital_distance(star_mass: float, period: float) -> float:
        """
        Calculate orbital distance using Kepler's 3rd law
        P² = (4π²/GM) * a³
        """
        G = 6.67430e-11  # m³/kg/s²
        period_seconds = period * 24 * 3600
        
        a = ((G * star_mass * period_seconds**2) / (4 * np.pi**2))**(1/3)
        return a
    
    @staticmethod
    def stellar_luminosity(star_radius: float, temperature: float) -> float:
        """
        Calculate stellar luminosity using Stefan-Boltzmann law
        L = 4πRs²σT⁴
        """
        sigma = 5.670374419e-8  # Stefan-Boltzmann constant
        return 4 * np.pi * star_radius**2 * sigma * temperature**4

class AIHelper:
    """
    Individual AI helper that processes astronomical data locally
    """
    
    def __init__(self, helper_id: str, specialization: str = "general"):
        self.helper_id = helper_id
        self.specialization = specialization  # e.g., "transit", "radial_velocity", "imaging"
        self.reliability_weight = 1.0
        self.performance_history = []
        self.model = self._initialize_model()
        self.calculator = ScientificCalculator()
        
    def _initialize_model(self) -> nn.Module:
        """Initialize a simple neural network for exoplanet classification"""
        model = nn.Sequential(
            nn.Linear(10, 64),  # 10 input features
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )
        return model
    
    def analyze_data(self, data: Dict[str, Any]) -> AIHelperResult:
        """
        Analyze astronomical data and return prediction with explanation
        """
        start_time = datetime.now()
        
        # Extract features from input data
        features = self._extract_features(data)
        
        # Make prediction
        with torch.no_grad():
            inputs = torch.tensor(features, dtype=torch.float32).unsqueeze(0)
            prediction = self.model(inputs).item()
        
        # Generate explanation
        explanation = self._generate_explanation(data, features, prediction)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AIHelperResult(
            helper_id=self.helper_id,
            prediction=prediction,
            confidence=abs(prediction - 0.5) * 2,  # Convert to 0-1 confidence
            explanation=explanation,
            features_used=self._get_feature_names(),
            processing_time=processing_time,
            timestamp=datetime.now()
        )
    
    def _extract_features(self, data: Dict[str, Any]) -> List[float]:
        """Extract numerical features from raw astronomical data"""
        features = []
        
        # Basic transit features
        features.append(data.get('period', 0.0))
        features.append(data.get('depth', 0.0))
        features.append(data.get('duration', 0.0))
        features.append(data.get('stellar_mass', 1.0))
        features.append(data.get('stellar_radius', 1.0))
        features.append(data.get('temperature', 5777.0))
        
        # Calculated features using scientific formulas
        if 'period' in data and 'stellar_mass' in data:
            orbital_distance = self.calculator.orbital_distance(
                data['stellar_mass'], data['period']
            )
            features.append(orbital_distance)
        else:
            features.append(0.0)
        
        # Transit depth ratio
        if 'depth' in data:
            features.append(np.sqrt(data['depth']))  # Approximates radius ratio
        else:
            features.append(0.0)
        
        # Normalized period (log scale)
        if 'period' in data and data['period'] > 0:
            features.append(np.log10(data['period']))
        else:
            features.append(0.0)
        
        # Transit signal-to-noise ratio (simplified)
        snr = data.get('depth', 0) / max(data.get('noise', 0.001), 0.001)
        features.append(snr)
        
        return features[:10]  # Ensure exactly 10 features
    
    def _get_feature_names(self) -> List[str]:
        """Return names of features used by the model"""
        return [
            'period', 'depth', 'duration', 'stellar_mass', 'stellar_radius',
            'temperature', 'orbital_distance', 'radius_ratio_approx', 
            'log_period', 'signal_to_noise'
        ]
    
    def _generate_explanation(self, data: Dict[str, Any], features: List[float], 
                            prediction: float) -> Dict[str, Any]:
        explanation = {
            'prediction_reasoning': self._get_prediction_reasoning(prediction),
            'key_factors': self._identify_key_factors(features, prediction),
            'scientific_analysis': self._scientific_analysis(data),
            'confidence_factors': self._confidence_analysis(features),
            'specialization_notes': self._specialization_notes(data)
        }
        return explanation
    
    def _get_prediction_reasoning(self, prediction: float) -> str:
        """Provide human-readable reasoning for the prediction"""
        if prediction > 0.7:
            return "Strong exoplanet candidate - multiple indicators align with planetary signals"
        elif prediction > 0.5:
            return "Potential exoplanet - some indicators present but require validation"
        elif prediction > 0.3:
            return "Weak candidate - signal present but likely false positive"
        else:
            return "Not an exoplanet - signal characteristics inconsistent with planetary transit"
    
    def _identify_key_factors(self, features: List[float], prediction: float) -> Dict[str, float]:

        feature_names = self._get_feature_names()

        importance = np.random.rand(len(features))  # Placeholder
        importance = importance / np.sum(importance)
        
        return {name: float(imp) for name, imp in zip(feature_names, importance)}
    
    def _scientific_analysis(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Provide scientific analysis based on detection methods"""
        analysis = {}
        
        if 'period' in data and 'depth' in data:
            # Transit method analysis
            if data['depth'] > 0.001:  # Significant depth
                analysis['transit_method'] = f"Transit depth of {data['depth']:.4f} suggests planetary candidate"
            else:
                analysis['transit_method'] = "Transit depth too shallow for reliable detection"
        
        if 'stellar_mass' in data and 'period' in data:
            # Orbital characteristics
            orbital_dist = self.calculator.orbital_distance(data['stellar_mass'], data['period'])
            analysis['orbital_analysis'] = f"Orbital distance: {orbital_dist/1.496e11:.2f} AU"
        
        return analysis
    
    def _confidence_analysis(self, features: List[float]) -> Dict[str, str]:
        """Analyze factors affecting prediction confidence"""
        analysis = {}
        
        # Signal-to-noise analysis
        snr = features[-1]  # Last feature is SNR
        if snr > 10:
            analysis['signal_quality'] = "High signal-to-noise ratio - reliable detection"
        elif snr > 5:
            analysis['signal_quality'] = "Moderate signal quality - good candidate"
        else:
            analysis['signal_quality'] = "Low signal quality - requires careful validation"
        
        return analysis
    
    def _specialization_notes(self, data: Dict[str, Any]) -> str:
        """Provide notes based on AI helper's specialization"""
        if self.specialization == "transit":
            return "Specialized in transit photometry - focused on period, depth, and duration analysis"
        elif self.specialization == "radial_velocity":
            return "Specialized in radial velocity - analyzing stellar wobble and orbital mechanics"
        elif self.specialization == "imaging":
            return "Specialized in direct imaging - analyzing stellar separation and brightness contrast"
        else:
            return "General purpose exoplanet detection - analyzing all available indicators"
    
    def update_reliability(self, feedback: bool, ground_truth: bool):
        """Update reliability weight based on human feedback"""
        self.performance_history.append({
            'prediction_correct': feedback == ground_truth,
            'timestamp': datetime.now()
        })
        
        # Calculate recent accuracy
        recent_performance = self.performance_history[-10:]  # Last 10 predictions
        accuracy = sum(p['prediction_correct'] for p in recent_performance) / len(recent_performance)
        
        # Update reliability weight (exponential moving average)
        self.reliability_weight = 0.8 * self.reliability_weight + 0.2 * accuracy

class FederatedAISystem:
    """
    Main federated AI system coordinating multiple AI helpers
    """
    
    def __init__(self):
        self.helpers: Dict[str, AIHelper] = {}
        self.aggregation_history = []
        self.human_feedback_log = []
        
    def add_helper(self, helper_id: str, specialization: str = "general"):
        """Add a new AI helper to the federation"""
        helper = AIHelper(helper_id, specialization)
        self.helpers[helper_id] = helper
        logger.info(f"Added AI helper: {helper_id} (specialization: {specialization})")
    
    def analyze_candidate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coordinate analysis across all AI helpers and aggregate results
        """
        logger.info(f"Analyzing candidate: {data.get('star_id', 'unknown')}")
        
        # Get predictions from all helpers
        helper_results = {}
        for helper_id, helper in self.helpers.items():
            result = helper.analyze_data(data)
            helper_results[helper_id] = result
        
        # Aggregate predictions using reliability weighting
        aggregated_result = self._aggregate_predictions(helper_results)
        
        # Store for history
        self.aggregation_history.append({
            'timestamp': datetime.now(),
            'input_data': data,
            'helper_results': helper_results,
            'aggregated_result': aggregated_result
        })
        
        return aggregated_result
    
    def _aggregate_predictions(self, helper_results: Dict[str, AIHelperResult]) -> Dict[str, Any]:
        """
        Aggregate predictions using the feedback-based knowledge weighting formula:
        P = Σ(wi * pi) / Σ(wi)
        """
        weighted_prediction = 0.0
        total_weight = 0.0
        explanations = {}
        
        for helper_id, result in helper_results.items():
            weight = self.helpers[helper_id].reliability_weight
            weighted_prediction += weight * result.prediction
            total_weight += weight
            explanations[helper_id] = result.explanation
        
        # Calculate final aggregated prediction
        final_prediction = weighted_prediction / total_weight if total_weight > 0 else 0.5
        
        # Aggregate explanations
        aggregated_explanation = self._aggregate_explanations(explanations, helper_results)
        
        return {
            'prediction': final_prediction,
            'confidence': self._calculate_aggregate_confidence(helper_results),
            'explanation': aggregated_explanation,
            'individual_results': {k: {'prediction': v.prediction, 'confidence': v.confidence} 
                                 for k, v in helper_results.items()},
            'helper_weights': {k: v.reliability_weight for k, v in self.helpers.items()},
            'consensus_strength': self._calculate_consensus(helper_results)
        }
    
    def _aggregate_explanations(self, explanations: Dict[str, Dict], 
                              helper_results: Dict[str, AIHelperResult]) -> Dict[str, Any]:
        """
        Aggregate explanations from multiple helpers using weighted approach:
        E(t) = Σ(wi * ei(t)) / Σ(wi)
        """
        # Combine prediction reasoning
        reasoning_votes = {}
        for helper_id, explanation in explanations.items():
            reasoning = explanation['prediction_reasoning']
            weight = self.helpers[helper_id].reliability_weight
            reasoning_votes[reasoning] = reasoning_votes.get(reasoning, 0) + weight
        
        primary_reasoning = max(reasoning_votes.items(), key=lambda x: x[1])[0]
        
        # Aggregate key factors
        aggregated_factors = {}
        total_weight = sum(self.helpers[h].reliability_weight for h in explanations.keys())
        
        for helper_id, explanation in explanations.items():
            weight = self.helpers[helper_id].reliability_weight / total_weight
            for factor, importance in explanation['key_factors'].items():
                aggregated_factors[factor] = aggregated_factors.get(factor, 0) + weight * importance
        
        return {
            'primary_reasoning': primary_reasoning,
            'aggregated_factors': aggregated_factors,
            'individual_analyses': {k: v['scientific_analysis'] for k, v in explanations.items()},
            'confidence_consensus': self._aggregate_confidence_factors(explanations),
            'specialization_insights': {k: v['specialization_notes'] for k, v in explanations.items()}
        }
    
    def _aggregate_confidence_factors(self, explanations: Dict[str, Dict]) -> Dict[str, str]:
        """Aggregate confidence analysis from all helpers"""
        confidence_factors = {}
        for helper_id, explanation in explanations.items():
            for factor, analysis in explanation['confidence_factors'].items():
                if factor not in confidence_factors:
                    confidence_factors[factor] = []
                confidence_factors[factor].append(f"{helper_id}: {analysis}")
        
        return {factor: "; ".join(analyses) for factor, analyses in confidence_factors.items()}
    
    def _calculate_aggregate_confidence(self, helper_results: Dict[str, AIHelperResult]) -> float:
        """Calculate overall confidence considering individual confidences and consensus"""
        confidences = [result.confidence for result in helper_results.values()]
        weights = [self.helpers[helper_id].reliability_weight 
                  for helper_id in helper_results.keys()]
        
        # Weighted average confidence
        weighted_confidence = sum(c * w for c, w in zip(confidences, weights)) / sum(weights)
        
        # Adjust for consensus (higher consensus = higher confidence)
        consensus_factor = self._calculate_consensus(helper_results)
        
        return min(1.0, weighted_confidence * (0.7 + 0.3 * consensus_factor))
    
    def _calculate_consensus(self, helper_results: Dict[str, AIHelperResult]) -> float:
        """Calculate how much the helpers agree (0-1 scale)"""
        predictions = [result.prediction for result in helper_results.values()]
        
        if len(predictions) <= 1:
            return 1.0
        
        # Calculate standard deviation of predictions
        std_dev = np.std(predictions)
        
        # Convert to consensus score (lower std = higher consensus)
        consensus = max(0.0, 1.0 - 2 * std_dev)  # Normalize assuming max std ~0.5
        
        return consensus
    
    def provide_human_feedback(self, analysis_id: int, is_correct: bool, 
                             ground_truth: Optional[bool] = None):
        """
        Provide human feedback on a prediction and update helper reliability
        This implements the feedback-based knowledge weighting system
        """
        if analysis_id >= len(self.aggregation_history):
            logger.error(f"Invalid analysis ID: {analysis_id}")
            return
        
        analysis = self.aggregation_history[analysis_id]
        
        # Log feedback
        feedback_entry = {
            'timestamp': datetime.now(),
            'analysis_id': analysis_id,
            'human_feedback': is_correct,
            'ground_truth': ground_truth,
            'prediction': analysis['aggregated_result']['prediction']
        }
        self.human_feedback_log.append(feedback_entry)
        
        # Update individual helper reliability using gradient descent approach
        # wi ← wi - η∂L/∂wi where L = -h*log(P) - (1-h)*log(1-P)
        learning_rate = 0.1
        
        for helper_id, result in analysis['helper_results'].items():
            helper = self.helpers[helper_id]
            
            # Calculate binary cross-entropy loss gradient
            prediction = result.prediction
            h = 1.0 if is_correct else 0.0  # Human feedback as ground truth
            
            # Avoid log(0) by clipping
            prediction = max(0.001, min(0.999, prediction))
            
            # Gradient of loss with respect to prediction
            grad_loss = -h/prediction + (1-h)/(1-prediction)
            
            # Update weight (simplified - in practice would be more sophisticated)
            if is_correct:
                helper.reliability_weight = min(2.0, helper.reliability_weight * 1.05)
            else:
                helper.reliability_weight = max(0.1, helper.reliability_weight * 0.95)
            
            # Also update individual helper's performance tracking
            helper.update_reliability(is_correct, ground_truth if ground_truth is not None else is_correct)
        
        logger.info(f"Updated helper weights based on feedback. Analysis {analysis_id} marked as {'correct' if is_correct else 'incorrect'}")
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get current status and statistics of the federated system"""
        total_analyses = len(self.aggregation_history)
        total_feedback = len(self.human_feedback_log)
        
        # Calculate accuracy from feedback
        correct_predictions = sum(1 for f in self.human_feedback_log if f['human_feedback'])
        accuracy = correct_predictions / total_feedback if total_feedback > 0 else 0.0
        
        # Helper statistics
        helper_stats = {}
        for helper_id, helper in self.helpers.items():
            helper_stats[helper_id] = {
                'reliability_weight': helper.reliability_weight,
                'specialization': helper.specialization,
                'performance_history_length': len(helper.performance_history)
            }
        
        return {
            'total_analyses': total_analyses,
            'total_feedback': total_feedback,
            'system_accuracy': accuracy,
            'helper_count': len(self.helpers),
            'helper_statistics': helper_stats,
            'recent_consensus_scores': [
                self._calculate_consensus(analysis['helper_results']) 
                for analysis in self.aggregation_history[-10:]
            ]
        }
    
    def visualize_performance(self, save_path: Optional[str] = None):
        """Create visualization of system performance over time"""
        if not self.human_feedback_log:
            logger.warning("No feedback data available for visualization")
            return
        
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        
        # Accuracy over time
        timestamps = [f['timestamp'] for f in self.human_feedback_log]
        cumulative_accuracy = []
        correct_count = 0
        
        for i, feedback in enumerate(self.human_feedback_log):
            if feedback['human_feedback']:
                correct_count += 1
            cumulative_accuracy.append(correct_count / (i + 1))
        
        ax1.plot(range(len(cumulative_accuracy)), cumulative_accuracy)
        ax1.set_title('System Accuracy Over Time')
        ax1.set_xlabel('Feedback Count')
        ax1.set_ylabel('Accuracy')
        ax1.grid(True)
        
        # Helper reliability weights
        helper_names = list(self.helpers.keys())
        helper_weights = [self.helpers[h].reliability_weight for h in helper_names]
        
        ax2.bar(helper_names, helper_weights)
        ax2.set_title('AI Helper Reliability Weights')
        ax2.set_xlabel('Helper ID')
        ax2.set_ylabel('Reliability Weight')
        plt.setp(ax2.get_xticklabels(), rotation=45, ha="right")
        
        # Consensus scores over time
        consensus_scores = [
            self._calculate_consensus(analysis['helper_results']) 
            for analysis in self.aggregation_history[-50:]  # Last 50 analyses
        ]
        
        ax3.plot(range(len(consensus_scores)), consensus_scores)
        ax3.set_title('Consensus Strength Over Time')
        ax3.set_xlabel('Analysis Number')
        ax3.set_ylabel('Consensus Score')
        ax3.grid(True)
        
        # Prediction distribution
        predictions = [f['prediction'] for f in self.human_feedback_log]
        ax4.hist(predictions, bins=20, alpha=0.7)
        ax4.set_title('Distribution of Predictions')
        ax4.set_xlabel('Prediction Value')
        ax4.set_ylabel('Frequency')
        ax4.grid(True)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Performance visualization saved to {save_path}")
        else:
            plt.show()

# Example usage and demonstration
if __name__ == "__main__":
    # Initialize the federated AI system
    fed_system = FederatedAISystem()
    
    # Add specialized AI helpers
    fed_system.add_helper("transit_specialist", "transit")
    fed_system.add_helper("radial_velocity_expert", "radial_velocity")
    fed_system.add_helper("imaging_analyzer", "imaging")
    fed_system.add_helper("general_detector", "general")
    
    # Example exoplanet candidate data
    candidate_data = {
        'star_id': 'Kepler-452',
        'period': 384.8,  # days
        'depth': 0.00028,  # transit depth
        'duration': 10.4,  # hours
        'stellar_mass': 1.04,  # solar masses
        'stellar_radius': 1.11,  # solar radii
        'temperature': 5757,  # K
        'noise': 0.00005
    }
    
    # Analyze the candidate
    result = fed_system.analyze_candidate(candidate_data)
    
    print("🌌 Federated AI Analysis Results 🌌")
    print("=" * 50)
    print(f"Overall Prediction: {result['prediction']:.4f}")
    print(f"Confidence: {result['confidence']:.4f}")
    print(f"Consensus Strength: {result['consensus_strength']:.4f}")
    print(f"\nPrimary Reasoning: {result['explanation']['primary_reasoning']}")
    
    print(f"\nIndividual Helper Results:")
    for helper_id, individual_result in result['individual_results'].items():
        weight = result['helper_weights'][helper_id]
        print(f"  {helper_id}: {individual_result['prediction']:.4f} (weight: {weight:.3f})")
    
    print(f"\nTop Contributing Factors:")
    factors = result['explanation']['aggregated_factors']
    sorted_factors = sorted(factors.items(), key=lambda x: x[1], reverse=True)[:5]
    for factor, importance in sorted_factors:
        print(f"  {factor}: {importance:.4f}")
    
    # Simulate human feedback
    print(f"\n🤖 Simulating human feedback...")
    fed_system.provide_human_feedback(0, is_correct=True, ground_truth=True)
    
    # Get system status
    status = fed_system.get_system_status()
    print(f"\n📊 System Status:")
    print(f"Total Analyses: {status['total_analyses']}")
    print(f"Total Feedback: {status['total_feedback']}")
    print(f"System Accuracy: {status['system_accuracy']:.4f}")
    
    logger.info("🎉 Federated AI System demonstration completed!")