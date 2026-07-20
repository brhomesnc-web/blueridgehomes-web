export type CalendarSlot = {
  month: string;
  topic: string;
  keyword: string;
  audience: string;
};

// Seeded from the marketing strategy §10.1 Blog Content Calendar.
// Ordered as planned; the drawer pre-fills index 0 as the next recommended slot.
//
// This is also the seed for the future DB-backed managed calendar — kept as a
// plain typed array so it can be lifted into a table without reshaping.
export const CONTENT_CALENDAR: CalendarSlot[] = [
  { month: "April", topic: "How Much Does It Cost to Build a Custom Home in Asheville in 2026?", keyword: "cost to build house Asheville", audience: "first-time custom-home buyers" },
  { month: "April", topic: "5 Resilient Design Features Every WNC Home Should Have After Helene", keyword: "resilient home building Asheville", audience: "resilience-minded rebuilders" },
  { month: "May", topic: "Asheville Building Permits: A Homeowner's Complete Guide", keyword: "Asheville building permits", audience: "first-time custom-home buyers" },
  { month: "May", topic: "Kitchen Remodel in Asheville: Timeline, Costs, and Design Trends", keyword: "kitchen remodel Asheville NC", audience: "renovation and addition homeowners" },
  { month: "June", topic: "ADUs in Asheville: Can You Build a Guest House on Your Property?", keyword: "ADU Asheville NC regulations", audience: "renovation and addition homeowners" },
  { month: "June", topic: "How to Choose the Right General Contractor in Western NC", keyword: "hire contractor Asheville", audience: "first-time custom-home buyers" },
  { month: "July", topic: "Green Building Certifications Explained: What Matters for Your Home", keyword: "green home builder Asheville", audience: "resilience-minded rebuilders" },
  { month: "July", topic: "Home Renovation vs. New Build: Which Is Right for You?", keyword: "renovation vs new build cost", audience: "renovation and addition homeowners" },
];
