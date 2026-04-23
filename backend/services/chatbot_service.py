import random

def get_chatbot_response(message, user=None):
    """
    Comprehensive AI Medical Assistant logic for OrganMatch.
    This provides detailed, high-quality information about the platform.
    """
    msg = message.lower().strip()
    
    # User Context
    role = user.role if user else 'guest'
    name = user.username if user else 'there'

    # --- CATEGORY: MATCHING PROCESS & AI SCORING ---
    if any(k in msg for k in ['match', 'score', 'process', 'how it works', 'working', 'logic']):
        return (
            "OrganMatch uses a 5-pillar AI Scoring Algorithm to ensure fair and clinically accurate matching:\n\n"
            "1. BLOOD COMPATIBILITY (30% Weight): HLA and ABO cross-matching are evaluated first. If blood types are incompatible, a match is not generated.\n"
            "2. MEDICAL URGENCY (30% Weight): Patients with critical (9-10) urgency scores are prioritized globally.\n"
            "3. ORGAN QUALITY & PARAMETERS (20% Weight): Our system analyzes donor organ health, medical history, and age factors to predict successful outcome probability.\n"
            "4. REGIONAL PROXIMITY (10% Weight): We calculate the distance between hospital nodes to ensure organ viability during transport.\n"
            "5. WAITING TIME (10% Weight): Among equal clinical candidates, the person waiting longest on the registry is chosen."
        )

    # --- CATEGORY: BLOOD TYPES & COMPATIBILITY ---
    if any(k in msg for k in ['blood', 'compatibility', 'donor group', 'recipient group', 'hla', 'abo']):
        return (
            "Blood compatibility is the first clinical filter in our system. Here is the general rulebook we follow:\n\n"
            "• Type O- : The Universal Donor. Can donate to ANY blood group.\n"
            "• Type O+ : Can donate to O+, A+, B+, AB+.\n"
            "• Type A  : Can donate to other A groups and AB groups.\n"
            "• Type B  : Can donate to other B groups and AB groups.\n"
            "• Type AB+: The Universal Recipient. Can receive from ANY blood group.\n\n"
            "If your blood type isn't compatible with a donor, the AI will not show you the match record to maintain registry integrity."
        )

    # --- CATEGORY: URGENCY & PRIORITY ---
    if any(k in msg for k in ['urgency', 'priority', 'score 1 to 10', 'critical', 'how are urgency', 'status']):
        return (
            "Urgency scores are clinical metrics assigned by your hospital admin based on your medical severity:\n\n"
            "• 9-10 (Critical): Immediate transplant need. Prioritized across all regions.\n"
            "• 6-8 (High): Stable but deteriorating. Monitored for near-term matching.\n"
            "• 4-5 (Moderate): Standard monitoring.\n"
            "• 1-3 (Stable): Active on the registry but not in immediate distress.\n\n"
            "The AI continuously recalibrates your position based on real-time data from your lab reports."
        )

    # --- CATEGORY: REGISTRATION & VERIFICATION ---
    if any(k in msg for k in ['register', 'verify', 'verification', 'how to join', 'rejected', 'pending']):
        return (
            "The registration and verification process follows these steps:\n\n"
            "1. REGISTRATION: Complete your profile with accurate medical and location data.\n"
            "2. REPORT UPLOAD: Upload valid lab reports and government identity proofs (PDF/Images).\n"
            "3. HOSPITAL REVIEW: A clinical administrator from your assigned hospital node will review your documents.\n"
            "4. VERIFICATION: Once clinical data is confirmed, your status changes to 'Verified' and you enter the AI Matching Queue.\n\n"
            "If you are 'Rejected', please check your profile for missing data or contact your hospital support desk."
        )

    # --- CATEGORY: ORGAN TYPES ---
    if any(k in msg for k in ['organ', 'kidney', 'liver', 'heart', 'lung', 'pancreas']):
        return (
            "Currently, OrganMatch supports the following organ specializations:\n\n"
            "• KIDNEY: Uses GFR and creatinine levels for scoring.\n"
            "• LIVER: Prioritizes based on MELD score equivalents.\n"
            "• HEART: Highest priority for critical urgency cases.\n\n"
            "Future updates will include skin, cornea, and bone marrow registry integrations."
        )

    # --- CATEGORY: ROLE-SPECIFIC GUIDANCE (DONOR) ---
    if role == 'donor' and any(k in msg for k in ['what to do', 'next step', 'dashboard', 'process', 'guide']):
        return (
            f"Hello {name}, as a Donor, your primary dashboard features:\n\n"
            "• MEDICAL RECORDS: Upload your latest health reports to start the verification.\n"
            "• MATCH RECORDS: Once verified, you will see compatible recipients here.\n"
            "• PROTOCOL REVIEW: Examine the AI rationale before consenting to a match.\n"
            "• TIMELINE: Track every step from hospital review to the final surgery status."
        )
    
    # --- CATEGORY: ROLE-SPECIFIC GUIDANCE (RECIPIENT) ---
    if role == 'recipient' and any(k in msg for k in ['where', 'how do i', 'waiting', 'search', 'patient']):
        return (
            f"Hi {name}, as a Recipient (Patient), you should focus on:\n\n"
            "• URGENCY SCORE: Ensure your medical details are updated so your score is accurate.\n"
            "• LAB REPORTS: Only verified lab reports allow our AI to generate high-probability matches.\n"
            "• ACTIVE MATCHES: Check this section regularly. If a donor matches your parameters, we will notify you and your hospital node immediately."
        )

    # --- CATEGORY: SAFETY & EMERGENCY ---
    if any(k in msg for k in ['emergency', 'urgent', 'pain', 'hospital', 'accident', 'dying', 'distress']):
        return (
            "⚠️ CRITICAL NOTICE: I am an AI Assistant trained on registry data, NOT a medical doctor.\n\n"
            "If you or someone else is experiencing severe pain, difficulty breathing, or any life-threatening emergency, stop using this app and:\n"
            "1. Call your country's Emergency Number (e.g., 911 in US, 102 in India).\n"
            "2. Go to the nearest Emergency Room (ER).\n"
            "3. Contact your primary transplant coordinator or family members immediately."
        )

    # --- CATEGORY: GREETINGS & INTRO ---
    if any(k in msg for k in ['hello', 'hi', 'hey', 'start', 'introduce', 'who are you', 'help']):
        return (
            f"Greetings {name}! I am the OrganMatch Smart Assistant 🤖.\n\n"
            "I provide end-to-end guidance on:\n"
            "• Our AI Matching Algorithm & Scores\n"
            "• Blood Group Compatibility Protocols\n"
            "• User Registration & Medical Verification Steps\n"
            "• Hospital Registry Nodes & Urgency Scales\n\n"
            "What specific part of the platform can I explain to you in detail?"
        )

    # --- UNIVERSAL FALLBACK ---
    return (
        "I want to make sure I give you a complete and accurate answer. Could you please specify if you're asking about:\n"
        "1. The AI Matching Process & Scoring Criteria?\n"
        "2. Blood Compatibility & Cross-matching?\n"
        "3. Registration/Verification Troubleshooting?\n"
        "4. Role-specific dashboard features (Donor/Recipient)?\n\n"
        "Type one of these topics so I can provide a comprehensive guide!"
    )
