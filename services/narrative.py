from models import DistrictHealthStatus

class NarrativeGenerator:
    def generate(self, status: DistrictHealthStatus) -> str:
        if status.chiScore > 80:
            return "What's happening right now: All civic systems operating nominally. Why it matters to your day: Expect normal commute times and clear conditions."
        elif status.chiScore > 50:
            anom = "Elevated volume in civic reports" if not status.activeAnomalies else "Compound disruptions detected"
            return f"What's happening right now: {anom} causing minor delays. Why it matters to your day: Caution advised in affected transit corridors."
        else:
            return "What's happening right now: Critical compound disruption spanning weather, transit, and 311 emergencies. Why it matters to your day: Significant localized hazards; avoid travel in affected zones."

narrative_gen = NarrativeGenerator()
