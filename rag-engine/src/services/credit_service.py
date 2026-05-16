import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from src.db.supabase_client import supabase

PLAN_LIMITS = {
    "free": {
        "max_projects": 3,
        "max_sources_per_project": 12,
        "daily_credits": 50
    },
    "beta": {
        "max_projects": 10,
        "max_sources_per_project": 50,
        "daily_credits": 100
    },
    "pro": {
        "max_projects": 100,
        "max_sources_per_project": 500,
        "daily_credits": 1000
    }
}

class CreditService:
    @staticmethod
    async def get_user_status(user_id: str) -> Dict[str, Any]:
        """
        Retrieves user plan, source counts, and current credit balance.
        """
        if not user_id:
            return {"plan": "free", "credits": 0, "projects": 0, "sources": 0}
            
        # 1. Get Profile & Credits
        profile = supabase.table("user_profiles").select("plan").eq("id", user_id).execute()
        credits = supabase.table("credits").select("balance, last_reset_at").eq("user_id", user_id).execute()
        
        plan = profile.data[0].get("plan", "free") if profile.data else "free"
        balance = credits.data[0].get("balance", 0) if credits.data else 0
        last_reset = credits.data[0].get("last_reset_at") if credits.data else None
        
        # 2. Daily Reset Logic
        if last_reset:
            last_date = datetime.fromisoformat(last_reset.replace('Z', '+00:00'))
            if last_date.date() < datetime.now(timezone.utc).date():
                # Reset to daily limit
                balance = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])["daily_credits"]
                supabase.table("credits").update({
                    "balance": balance,
                    "last_reset_at": datetime.now(timezone.utc).isoformat()
                }).eq("user_id", user_id).execute()

        # 3. Get Project & Source Counts
        projects = supabase.table("projects").select("id", count="exact").eq("user_id", user_id).execute()
        sources = supabase.table("knowledge_base").select("id", count="exact").eq("user_id", user_id).execute()

        return {
            "plan": plan,
            "credits": balance,
            "project_count": projects.count or 0,
            "source_count": sources.count or 0,
            "limits": PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
        }

    @staticmethod
    async def deduct_credits(user_id: str, tokens: int):
        """
        Deducts credits based on token usage. 
        Logic: 1 Credit per 1000 tokens. Minimum 1 credit per call.
        """
        if not user_id or tokens <= 0:
            return
            
        credits_to_deduct = max(1, tokens // 1000)
        
        # Atomically decrement balance (using RPC if available, or simple update for now)
        # Handle cases where the credits record doesn't exist
        current = supabase.table("credits").select("balance").eq("user_id", user_id).execute()
        if current.data:
            new_balance = max(0, current.data[0]["balance"] - credits_to_deduct)
            supabase.table("credits").update({"balance": new_balance}).eq("user_id", user_id).execute()

    @staticmethod
    async def check_limits(user_id: str, project_id: Optional[str] = None):
        """
        Returns True if user is within their plan limits, False otherwise.
        """
        status = await CreditService.get_user_status(user_id)
        limits = status["limits"]
        
        # Check Credit Balance
        if status["credits"] <= 0:
            raise ValueError("Insufficient daily credits. Please upgrade or wait for reset.")
            
        # Check Project Limit
        if status["project_count"] >= limits["max_projects"]:
            raise ValueError(f"Project limit reached ({limits['max_projects']}) for {status['plan']} plan.")
            
        # Check Source Limit (per project)
        if project_id:
            proj_sources = supabase.table("knowledge_base").select("id", count="exact").eq("project_id", project_id).execute()
            if proj_sources.count >= limits["max_sources_per_project"]:
                raise ValueError(f"Source limit reached ({limits['max_sources_per_project']}) for this project.")
                
        return True

credit_service = CreditService()
