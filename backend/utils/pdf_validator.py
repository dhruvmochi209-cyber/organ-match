import os
import PyPDF2
from datetime import datetime, timedelta

def validate_medical_pdf(absolute_file_path, organ=None):
    """
    Validates a PDF to ensure it is a real-time medical report and matches the selected organ.
    
    Returns (True, "Valid") if successful.
    Returns (False, "Error Message") if invalid.
    """
    if not absolute_file_path.lower().endswith('.pdf'):
        return False, "Strict System Rule: Only PDF files are allowed for Medical Reports."
        
    try:
        with open(absolute_file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            
            # --- Date/Time Scanning (Recent Rule) ---
            metadata = reader.metadata
            if metadata and metadata.creation_date:
                creation_date = metadata.creation_date
                try:
                    if hasattr(creation_date, 'tzinfo'):
                        naive_creation = creation_date.replace(tzinfo=None)
                        if datetime.now() - naive_creation > timedelta(days=60): # Increased to 60 days for flexibility
                            return False, "Report is older than 60 days! Please upload a recent medical report."
                except Exception:
                    pass
            
            # --- Text Extraction & Keyword Check ---
            text = ""
            for i in range(min(3, len(reader.pages))): # Scan first 3 pages
                extracted = reader.pages[i].extract_text()
                if extracted:
                    text += extracted.lower()
                    
            if len(text.strip()) < 20:
                return False, "Could not extract digital text. Please upload a valid digital Lab PDF, not an image scan."
                
            # Base medical keywords
            base_keywords = ['blood', 'laboratory', 'hospital', 'clinic', 'patient', 'report', 'test', 'result', 'haemoglobin', 'diagnostic']
            
            # Organ-specific keywords
            organ_keywords = {
                'Heart': ['heart', 'cardiac', 'ecg', 'ventricular', 'atrial', 'aorta', 'troponin', 'cardiology', 'pulse', 'valve'],
                'Kidney': ['kidney', 'renal', 'creatinine', 'gfr', 'nephrology', 'dialysis', 'uremic', 'urine', 'bladder', 'potassium'],
                'Liver': ['liver', 'hepatic', 'bilirubin', 'sgot', 'sgpt', 'alt', 'ast', 'albumin', 'gallbladder', 'bile'],
                'Lung': ['lung', 'pulmonary', 'respiratory', 'oxygen', 'spo2', 'breath', 'alveoli', 'bronchial', 'thorax'],
                'Pancreas': ['pancreas', 'insulin', 'glucose', 'diabetes', 'amylase', 'lipase', 'islets', 'endocrine'],
            }
            
            # 1. Check base medical validity
            matched_base = [word for word in base_keywords if word in text]
            if len(matched_base) < 1:
                return False, "Document Irrelevant: This doesn't look like a standard laboratory or hospital report."
                
            # 2. Check organ-specific validity if provided
            if organ and organ in organ_keywords:
                keywords = organ_keywords[organ]
                matched_organ = [word for word in keywords if word in text]
                
                # If zero organ-specific keywords match, it's likely the wrong report
                if len(matched_organ) < 1:
                    return False, f"Invalid Report: This document does not contain any specific medical terms for a {organ} report. Please upload a valid {organ} medical record."

            return True, "Valid"
            
    except Exception as e:
        return False, f"Failed to verify the document: {str(e)}"
            
    except Exception as e:
        return False, f"Failed to verify the document: {str(e)}"
