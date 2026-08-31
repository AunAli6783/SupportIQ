from typing import List, Optional
from pydantic import BaseModel, Field

class Slide(BaseModel):
    title: str = Field(description="Title of the presentation slide")
    bullets: List[str] = Field(description="Executive bullet points and insights")
    chart_type: Optional[str] = Field(
        default=None, 
        description="Suggested chart type: 'bar', 'pie', 'column', 'line', or None"
    )

class PresentationPlan(BaseModel):
    title: str = Field(description="Main presentation title")
    subtitle: str = Field(description="Executive subtitle containing key KPIs")
    slides: List[Slide] = Field(description="Ordered list of presentation slides")
