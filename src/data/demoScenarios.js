// InfoMind AI - Comprehensive Demo Scenarios & Knowledge Graphs

export const DEMO_SCENARIOS = {
  ma_due_diligence: {
    id: "ma_due_diligence",
    name: "M&A Due Diligence & Vendor Dispute",
    badge: "Enterprise Acquisition",
    description: "Multi-party corporate buyout analysis cross-referencing buyer agreements, supplier lock-in, board memos, and audit figures.",
    tagline: "Uncovered $700K revenue discrepancy and missing IP assignment prior to signing.",
    healthScore: {
      overall: 82,
      grade: "B",
      status: "Attention Required",
      summary: "High accuracy on operational terms, but 3 critical contradictions and 2 missing contractual exhibits require immediate resolution before closing.",
      pillars: [
        { name: "Completeness", score: 86, benchmark: 95, detail: "Missing Schedule B (IP Assignment) and Officer Certificates" },
        { name: "Consistency", score: 68, benchmark: 98, detail: "Revenue ($14.2M vs $13.5M) and Closing Date mismatches detected" },
        { name: "Accuracy", score: 94, benchmark: 90, detail: "All verifiable entity and banking references verified with SEC filings" },
        { name: "Recency", score: 91, benchmark: 85, detail: "Latest amendment executed 6 days ago; audit figures fresh" },
        { name: "Actionability", score: 79, benchmark: 90, detail: "4 immediate cross-functional legal and finance workflows pending" }
      ]
    },
    documents: [
      {
        id: "doc-1",
        name: "Project_Titan_Acquisition_Agreement_v4.pdf",
        type: "pdf",
        size: "3.4 MB",
        pages: 64,
        date: "Oct 02, 2026",
        department: "Legal / M&A",
        author: "Sullivan & Cromwell LLP",
        status: "Analyzed",
        health: 89,
        summary: "Definitive Purchase Agreement for acquisition of Titan Technologies Inc. for an aggregate purchase price of $42,500,000 in cash and equity. Outlines representations, warranties, indemnification cap ($4.25M), and closing conditions.",
        keyTakeaways: [
          "Target valuation locked at $42,500,000 subject to working capital adjustment.",
          "Target Closing Date specified as November 15, 2026 at 10:00 AM EST.",
          "Indemnification basket set at $250,000 with a liability cap of 10% of purchase price.",
          "Section 6.3 mandates delivery of Schedule B (IP Assignment & Patent Inventory)."
        ],
        snippets: [
          { page: 12, section: "Section 2.1 (Purchase Price)", text: "The aggregate consideration payable by Buyer to Sellers shall be Forty-Two Million Five Hundred Thousand Dollars ($42,500,000)." },
          { page: 18, section: "Section 3.2 (Closing Date)", text: "The Closing shall take place remotely via electronic exchange of documents on November 15, 2026 (the 'Closing Date')." },
          { page: 34, section: "Section 6.3 (Intellectual Property)", text: "Sellers shall deliver complete Schedule B listing all registered patents, domain names, and proprietary source repositories prior to execution." }
        ],
        entities: {
          financial: ["$42,500,000 Purchase Price", "$4,250,000 Indemnity Cap", "$250,000 Basket"],
          dates: ["November 15, 2026 (Closing)", "December 31, 2026 (Escrow Release)"],
          parties: ["Meridian Holdings Corp (Buyer)", "Titan Technologies Inc (Seller)", "Crestview Escrow Services"],
          obligations: ["Delivery of Schedule B IP Schedule", "90-day post-close transition support", "Non-compete 36 months"]
        }
      },
      {
        id: "doc-2",
        name: "Apex_Logistics_Master_Vendor_Contract.docx",
        type: "docx",
        size: "820 KB",
        pages: 18,
        date: "Sep 14, 2026",
        department: "Procurement / Operations",
        author: "Apex Global Logistics Legal",
        status: "Analyzed",
        health: 76,
        summary: "Exclusive Master Services Agreement between Titan Tech and Apex Logistics for fulfillment infrastructure. Mandates Net 45 payment terms and carries an early termination penalty clause.",
        keyTakeaways: [
          "Exclusive vendor appointment through December 31, 2028 with 36-month automatic renewal.",
          "Early termination for convenience requires 180 days notice and a fixed penalty fee of $1,800,000.",
          "Payment terms explicitly designated as Net 45 calendar days upon invoice submission."
        ],
        snippets: [
          { page: 4, section: "Clause 4.1 (Payment Terms)", text: "All undisputed invoices submitted by Apex shall be payable Net 45 days from date of receipt." },
          { page: 9, section: "Clause 11.3 (Termination Fee)", text: "In the event Client terminates without cause prior to 2028, Client agrees to pay an early termination fee of $1,800,000 within 15 business days." }
        ],
        entities: {
          financial: ["$1,800,000 Early Termination Fee", "$450,000 Minimum Annual Commitment"],
          dates: ["December 31, 2028 (Term End)", "180-Day Notice Period"],
          parties: ["Apex Logistics Global LLC", "Titan Technologies Inc."],
          obligations: ["Exclusive fulfillment partner", "Net 45 payment remittance", "Tier-1 SLA uptime 99.8%"]
        }
      },
      {
        id: "doc-3",
        name: "Q3_Internal_Financial_Audit_Report.xlsx",
        type: "xlsx",
        size: "1.9 MB",
        pages: 12,
        date: "Sep 30, 2026",
        department: "Finance & Accounting",
        author: "Internal Audit Committee",
        status: "Analyzed",
        health: 93,
        summary: "Comprehensive reconciliation of Q3 operational figures, GAAP adjustments, and working capital status. Identifies $700K provision for product return warranties and flags vendor payment term standards.",
        keyTakeaways: [
          "Audited Net Revenue for Q3 2026 concluded at $13,500,000 after $700K warranty deduction.",
          "Gross Margin stands at 61.4% with Adjusted EBITDA of $3,210,000.",
          "Internal standard accounts payable policy is strictly enforced as Net 30 days."
        ],
        snippets: [
          { page: 2, section: "P&L Statement Tab", text: "Gross Revenue: $14,200,000. Less Warranty & Return Reserve: ($700,000). Net Recognized Revenue: $13,500,000." },
          { page: 5, section: "Working Capital Schedule", text: "All vendor accounts payable currently managed under corporate standard Net 30 day treasury policy." }
        ],
        entities: {
          financial: ["$13,500,000 Audited Net Revenue", "$14,200,000 Gross Billing", "$700,000 Warranty Reserve", "$3,210,000 EBITDA"],
          dates: ["September 30, 2026 (Audit Cutoff)", "Net 30 Days Standard AP"],
          parties: ["Audit Chair Marcus Vance", "Treasury Operations"],
          obligations: ["Quarterly GAAP warranty reconciliation", "Working capital floor $4,500,000"]
        }
      },
      {
        id: "doc-4",
        name: "Board_Executive_Briefing_Memo.txt",
        type: "txt",
        size: "45 KB",
        pages: 3,
        date: "Oct 05, 2026",
        department: "Executive Office",
        author: "Elena Rostova (CEO)",
        status: "Analyzed",
        health: 80,
        summary: "Confidential executive briefing circulated to the Board of Directors regarding transaction timeline, anticipated closing date, headline Q3 financial performance, and supplier flexibility.",
        keyTakeaways: [
          "Reported Q3 Net Revenue as $14,200,000 without noting the $700K warranty reserve reduction.",
          "Target closing date stated as November 1, 2026 (differs from definitive agreement).",
          "Asserted that vendor relationships are on flexible month-to-month terms without termination friction."
        ],
        snippets: [
          { page: 1, section: "Executive Summary", text: "We achieved record Q3 Net Revenue of $14.2M with strong forward momentum for closing Titan acquisition on Nov 1, 2026." },
          { page: 2, section: "Supplier Synergies", text: "Fulfillment contracts can be transitioned immediately post-closing without notable supplier termination friction." }
        ],
        entities: {
          financial: ["$14.2M Reported Q3 Revenue", "$2.8M Cost Synergies Target"],
          dates: ["November 1, 2026 (Target Close Date stated to Board)"],
          parties: ["Board of Directors", "Elena Rostova (CEO)"],
          obligations: ["Accelerated board sign-off by Oct 20"]
        }
      }
    ],
    conflicts: [
      {
        id: "conf-1",
        severity: "CRITICAL",
        category: "Financial Valuation",
        title: "Q3 Recognized Revenue Discrepancy ($700K Mismatch)",
        description: "Board Briefing asserts Q3 Net Revenue is $14,200,000, whereas Internal Financial Audit conclusively notes Net Recognized Revenue is $13,500,000 following a mandatory $700K warranty reserve deduction.",
        impact: "Could distort purchase price adjustment and working capital peg under Section 2.3 of Acquisition Agreement.",
        docA: {
          name: "Board_Executive_Briefing_Memo.txt",
          page: 1,
          quote: "We achieved record Q3 Net Revenue of $14.2M with strong forward momentum..."
        },
        docB: {
          name: "Q3_Internal_Financial_Audit_Report.xlsx",
          page: 2,
          quote: "Gross Revenue: $14,200,000. Less Warranty Reserve: ($700,000). Net Recognized Revenue: $13,500,000."
        },
        aiRecommendation: "Formally issue an audit erratum to the Board and reconcile Titan's baseline working capital target against audited $13.5M rather than headline $14.2M."
      },
      {
        id: "conf-2",
        severity: "CRITICAL",
        category: "Transaction Timeline",
        title: "Transaction Closing Date Contradiction (Nov 1 vs Nov 15)",
        description: "Executive Memo communicates closing to Board on November 1, 2026, while Definitive Acquisition Agreement stipulates Closing Date as November 15, 2026.",
        impact: "Misaligns escrow funding date, shareholder vote schedule, and lender debt drawdown timelines.",
        docA: {
          name: "Board_Executive_Briefing_Memo.txt",
          page: 1,
          quote: "...closing Titan acquisition on Nov 1, 2026."
        },
        docB: {
          name: "Project_Titan_Acquisition_Agreement_v4.pdf",
          page: 18,
          quote: "The Closing shall take place remotely... on November 15, 2026 (the 'Closing Date')."
        },
        aiRecommendation: "Align Board schedule with executed contract date of November 15, 2026 or draft formal Closing Date Amendment if early closing is required."
      },
      {
        id: "conf-3",
        severity: "HIGH",
        category: "Procurement & Cash Flow",
        title: "Vendor Payment Terms Conflict (Net 45 vs Net 30)",
        description: "Apex Logistics Contract legally specifies Net 45 days payment terms, but Internal Audit Schedule enforces corporate Net 30 day accounts payable terms.",
        impact: "Leads to disputed early-payment penalties or miscalculated working capital float of $450K.",
        docA: {
          name: "Apex_Logistics_Master_Vendor_Contract.docx",
          page: 4,
          quote: "All undisputed invoices submitted by Apex shall be payable Net 45 days from date of receipt."
        },
        docB: {
          name: "Q3_Internal_Financial_Audit_Report.xlsx",
          page: 5,
          quote: "All vendor accounts payable currently managed under corporate standard Net 30 day treasury policy."
        },
        aiRecommendation: "Update AP ERP schedule to override default Net 30 with Apex's contractual Net 45 terms, freeing $450K in short-term operating liquidity."
      },
      {
        id: "conf-4",
        severity: "MEDIUM",
        category: "Contractual Lock-in",
        title: "Supplier Termination Fee Omission ($1.8M Unbudgeted Liability)",
        description: "Board Memo claims fulfillment vendors have 'flexible month-to-month terms without notable friction', whereas Apex Logistics contract mandates a $1,800,000 early termination fee through 2028.",
        impact: "Unbudgeted $1.8M termination charge if buyer attempts planned post-merger logistics consolidation.",
        docA: {
          name: "Board_Executive_Briefing_Memo.txt",
          page: 2,
          quote: "Fulfillment contracts can be transitioned immediately post-closing without notable supplier termination friction."
        },
        docB: {
          name: "Apex_Logistics_Master_Vendor_Contract.docx",
          page: 9,
          quote: "...Client agrees to pay an early termination fee of $1,800,000 within 15 business days."
        },
        aiRecommendation: "Incorporate Apex Logistics contract into transition plan or factor $1.8M penalty into net synergy forecast."
      }
    ],
    missingInformation: [
      {
        id: "miss-1",
        urgency: "HIGH",
        category: "Intellectual Property",
        item: "Missing Schedule B: Patent & Proprietary Repository Inventory",
        reference: "Acquisition Agreement, Section 6.3 (page 34)",
        explanation: "Section 6.3 explicitly conditions execution on receipt of Schedule B, but the exhibit was omitted from the uploaded package. Essential for verifying code ownership.",
        action: "Issue formal legal exhibit request to Seller's counsel."
      },
      {
        id: "miss-2",
        urgency: "HIGH",
        category: "Governance & Compliance",
        item: "Officer Compliance Certificate & CFO Solvency Representation",
        reference: "Acquisition Agreement, Section 8.2(c)",
        explanation: "No signed certificate from Target's CFO validating balance sheet solvency and absence of undisclosed material adverse litigation.",
        action: "Add to pre-closing closing checklist escrow requirement."
      },
      {
        id: "miss-3",
        urgency: "MEDIUM",
        category: "Environmental & Real Estate",
        item: "Phase 1 Environmental Assessment for Dublin Fulfillment Hub",
        reference: "Apex Logistics Contract, Schedule 1 Facility Addendum",
        explanation: "Facility lease references hazardous material containment audit that is missing from diligence dataroom.",
        action: "Request facility inspection report from property lessor."
      }
    ],
    actions: [
      {
        id: "act-1",
        priority: "HIGH",
        category: "Financial Audit",
        title: "Reconcile $700K Revenue Discrepancy with Controller",
        due: "Within 24 Hours",
        impact: "Prevents $700K purchase price overpayment & SEC restatement risk",
        type: "memo",
        actionBtnText: "Generate Financial Reconciliation Memo",
        content: `MEMORANDUM FOR THE EXECUTIVE AUDIT COMMITTEE\n\nSUBJECT: Reconciliation of Q3 2026 Recognized Revenue vs. Board Briefing\nDATE: October 08, 2026\nPREPARED BY: InfoMind AI Automated Diligence Engine\n\n1. EXECUTIVE SUMMARY\nAn audit contradiction was detected between the Board Executive Briefing Memo ($14,200,000 headline revenue) and the Q3 Internal Financial Audit Report ($13,500,000 net GAAP revenue).\n\n2. ROOT CAUSE ANALYSIS\nA $700,000 warranty and return reserve provision was deducted in the internal audit ledger but was not factored into the briefing slide prepared for the Board of Directors.\n\n3. ACTION REQUIRED\n- Issue formal update to Board correcting Q3 Net Recognized Revenue to $13,500,000.\n- Recalibrate the Titan Acquisition working capital peg based on $13.5M baseline.`
      },
      {
        id: "act-2",
        priority: "HIGH",
        category: "Legal Diligence",
        title: "Request Missing Schedule B (IP Assignment) from Seller's Counsel",
        due: "Before Oct 12, 2026",
        impact: "Protects proprietary software ownership rights and ensures valid closing",
        type: "email",
        actionBtnText: "Draft Notice Email to Seller Counsel",
        content: `Subject: URGENT: Project Titan - Outstanding Schedule B (IP & Patent Schedule)\n\nDear Sullivan & Cromwell Deal Team,\n\nIn reviewing the execution drafts for the Project Titan Acquisition Agreement (v4), Section 6.3 stipulates the delivery of Schedule B (Comprehensive Intellectual Property & Patent Schedule).\n\nOur automated diligence engine (InfoMind AI) indicates that Schedule B is currently absent from the virtual dataroom.\n\nPlease furnish the signed exhibit and repository inventory at your earliest convenience to maintain our scheduled closing timetable.\n\nBest regards,\nCorporate M&A Legal Team`
      },
      {
        id: "act-3",
        priority: "MEDIUM",
        category: "Operations",
        title: "Draft AP Adjustment Notice for Apex Logistics (Net 45)",
        due: "Within 3 Days",
        impact: "Optimizes $450K working capital cash flow and aligns contract terms",
        type: "email",
        actionBtnText: "Draft AP Adjustment Notice",
        content: `Subject: Accounts Payable Directive - Apex Logistics Global Master Agreement (Net 45)\n\nTo: Treasury & Accounts Payable Operations\n\nPlease adjust the vendor payment profile for Apex Logistics Global LLC (Vendor #TX-8821) in the ERP from standard Net 30 to Net 45 calendar days, in strict compliance with Section 4.1 of the Master Vendor Agreement.\n\nThis adjustment preserves approximately $450,000 in short-term operating liquidity through the close of Q4.`
      },
      {
        id: "act-4",
        priority: "MEDIUM",
        category: "Corporate Strategy",
        title: "Prepare Board Addendum on Apex $1.8M Early Termination Exposure",
        due: "Before Board Meeting (Oct 18)",
        impact: "Prevents surprise post-acquisition synergy write-down",
        type: "memo",
        actionBtnText: "Generate Board Advisory Note",
        content: `EXECUTIVE ADVISORY BRIEFING: POST-MERGER LOGISTICS RESTRUCTURING RISKS\n\nContrary to assumptions of zero supplier lock-in, Apex Logistics Master Vendor Contract enforces a mandatory $1.8M termination charge if severed prior to Dec 31, 2028.\n\nRECOMMENDATION:\nOption A: Retain Apex through contract expiration to capture existing favorable freight volume discounts.\nOption B: Factor $1,800,000 into transition integration budget when computing net synergies.`
      }
    ],
    knowledgeGraph: {
      nodes: [
        { id: "n-acq", label: "Acquisition Agreement v4", type: "document", group: "doc", size: 28, color: "#2563EB" },
        { id: "n-apex", label: "Apex Logistics Contract", type: "document", group: "doc", size: 24, color: "#2563EB" },
        { id: "n-audit", label: "Q3 Internal Audit", type: "document", group: "doc", size: 24, color: "#2563EB" },
        { id: "n-board", label: "Board Memo", type: "document", group: "doc", size: 20, color: "#2563EB" },
        { id: "n-rev-diff", label: "Revenue Conflict: $700K", type: "conflict", group: "conflict", size: 26, color: "#EF4444" },
        { id: "n-close-diff", label: "Closing Date Conflict", type: "conflict", group: "conflict", size: 22, color: "#EF4444" },
        { id: "n-net-diff", label: "Payment Term Mismatch", type: "conflict", group: "conflict", size: 20, color: "#F59E0B" },
        { id: "n-sched-b", label: "Missing Schedule B (IP)", type: "missing", group: "missing", size: 24, color: "#8B5CF6" },
        { id: "n-price", label: "$42.5M Purchase Price", type: "entity", group: "entity", size: 18, color: "#10B981" },
        { id: "n-nov15", label: "Nov 15, 2026 Closing", type: "entity", group: "entity", size: 16, color: "#06B6D4" },
        { id: "n-nov1", label: "Nov 1, 2026 Board Date", type: "entity", group: "entity", size: 16, color: "#06B6D4" },
        { id: "n-elena", label: "Elena Rostova (CEO)", type: "person", group: "person", size: 18, color: "#EC4899" },
        { id: "n-apex-fee", label: "$1.8M Termination Fee", type: "entity", group: "entity", size: 18, color: "#F97316" }
      ],
      links: [
        { source: "n-board", target: "n-rev-diff", label: "states $14.2M", style: "dashed" },
        { source: "n-audit", target: "n-rev-diff", label: "reports $13.5M", style: "dashed" },
        { source: "n-board", target: "n-close-diff", label: "targets Nov 1", style: "dashed" },
        { source: "n-acq", target: "n-close-diff", label: "stipulates Nov 15", style: "dashed" },
        { source: "n-apex", target: "n-net-diff", label: "mandates Net 45", style: "solid" },
        { source: "n-audit", target: "n-net-diff", label: "enforces Net 30", style: "solid" },
        { source: "n-acq", target: "n-sched-b", label: "requires exhibit", style: "solid" },
        { source: "n-acq", target: "n-price", label: "stipulates valuation", style: "solid" },
        { source: "n-acq", target: "n-nov15", label: "contract date", style: "solid" },
        { source: "n-board", target: "n-nov1", label: "assumed date", style: "solid" },
        { source: "n-board", target: "n-elena", label: "authored by", style: "solid" },
        { source: "n-apex", target: "n-apex-fee", label: "specifies clause", style: "solid" }
      ]
    },
    comparisonMatrix: {
      documents: [
        "Project_Titan_Acquisition_Agreement_v4.pdf",
        "Apex_Logistics_Master_Vendor_Contract.docx",
        "Q3_Internal_Financial_Audit_Report.xlsx",
        "Board_Executive_Briefing_Memo.txt"
      ],
      dimensions: [
        {
          name: "Reported / Baseline Revenue",
          TitanAcq: "Not applicable (Asset Purchase)",
          ApexVendor: "Not applicable ($450K annual fee)",
          InternalAudit: "$13.5M Net GAAP Revenue ($14.2M Gross less $700K reserve)",
          BoardMemo: "$14.2M Net Revenue (No reserve noted)",
          status: "conflict"
        },
        {
          name: "Effective / Target Closing Date",
          TitanAcq: "November 15, 2026 (10:00 AM EST)",
          ApexVendor: "Active through Dec 31, 2028",
          InternalAudit: "Audit as of Sept 30, 2026",
          BoardMemo: "November 1, 2026",
          status: "conflict"
        },
        {
          name: "Governing Payment Terms",
          TitanAcq: "Wire transfer on Closing Date",
          ApexVendor: "Net 45 calendar days",
          InternalAudit: "Standard Net 30 day treasury policy",
          BoardMemo: "Flexible month-to-month",
          status: "conflict"
        },
        {
          name: "Contractual Termination Liability",
          TitanAcq: "$4.25M Indemnification Cap",
          ApexVendor: "$1.8M Early Termination Fee",
          InternalAudit: "No termination penalty recorded",
          BoardMemo: "'No notable friction or penalty'",
          status: "conflict"
        },
        {
          name: "Intellectual Property Warranty",
          TitanAcq: "Schedule B Required (Missing)",
          ApexVendor: "Standard vendor trademark license",
          InternalAudit: "R&D software capitalization complete",
          BoardMemo: "'100% clean IP ownership'",
          status: "missing"
        },
        {
          name: "Governing Law & Jurisdiction",
          TitanAcq: "Delaware Chancery Court",
          ApexVendor: "State of New York",
          InternalAudit: "US GAAP / Delaware",
          BoardMemo: "Delaware",
          status: "aligned"
        }
      ]
    }
  },

  clinical_trial_compliance: {
    id: "clinical_trial_compliance",
    name: "Clinical Trial & Regulatory Compliance Audit",
    badge: "Life Sciences & FDA",
    description: "Deep cross-verification of Phase III CardioVax protocol guidelines, FDA Investigational New Drug (IND) approval parameters, DSMB safety reports, and patient consent documentation.",
    tagline: "Flagged protocol version discrepancy and missing adverse event co-signatures.",
    healthScore: {
      overall: 78,
      grade: "C+",
      status: "Regulatory Risk",
      summary: "Patient safety metrics meet standard, but a dosage amendment conflict between FDA IND memo and clinical protocol creates critical regulatory exposure.",
      pillars: [
        { name: "Completeness", score: 81, benchmark: 95, detail: "Missing Principal Investigator Sign-off on Q2 Adverse Events" },
        { name: "Consistency", score: 62, benchmark: 98, detail: "Dosage ceiling mismatch (50mg vs 75mg) across IND and Protocol" },
        { name: "Accuracy", score: 92, benchmark: 90, detail: "Patient biometric and placebo control numbers verified" },
        { name: "Recency", score: 89, benchmark: 85, detail: "FDA correspondence verified within 14 calendar days" },
        { name: "Actionability", score: 74, benchmark: 90, detail: "3 mandatory institutional review board notifications required" }
      ]
    },
    documents: [
      {
        id: "doc-c1",
        name: "Phase_III_CardioVax_Clinical_Protocol_v2.pdf",
        type: "pdf",
        size: "4.1 MB",
        pages: 82,
        date: "Aug 20, 2026",
        department: "Clinical Operations",
        author: "BioVanguard Therapeutics",
        status: "Analyzed",
        health: 84,
        summary: "Primary clinical trial design for CardioVax cohort of 1,200 subjects across 14 international research sites. Outlines dosage titration, secondary endpoints, and toxicity thresholds.",
        keyTakeaways: [
          "Maximum allowable single daily dose defined as 75mg in titration cohort C.",
          "Patient monitoring window set at 28 days post initial administration.",
          "Exclusion criteria includes subjects with prior cardiac stent implantation within 12 months."
        ],
        snippets: [
          { page: 24, section: "Section 4.3 (Dosage Ceiling)", text: "Cohort C subjects shall receive daily escalated titration up to a maximum ceiling of 75mg daily." }
        ],
        entities: {
          financial: ["$18.4M Clinical Trial Grant"],
          dates: ["August 20, 2026", "October 30, 2026 (Phase III Milestone)"],
          parties: ["BioVanguard Therapeutics", "Global Clinical Research Org"],
          obligations: ["Daily ECG telemetric monitoring", "28-day follow-up report"]
        }
      },
      {
        id: "doc-c2",
        name: "FDA_Investigational_New_Drug_IND_Notice.docx",
        type: "docx",
        size: "640 KB",
        pages: 14,
        date: "Sep 08, 2026",
        department: "Regulatory Affairs",
        author: "FDA Center for Drug Evaluation (CDER)",
        status: "Analyzed",
        health: 91,
        summary: "Formal FDA IND response memo authorizing Phase III commencement subject to strict safety dosage limitation cap of 50mg daily.",
        keyTakeaways: [
          "FDA mandated dosage cap strictly limited to 50mg until animal toxicology study completes.",
          "Mandatory adverse event notification within 48 hours for Grade 3 or higher toxicity.",
          "Requires independent Data Safety Monitoring Board quarterly convening."
        ],
        snippets: [
          { page: 3, section: "Specific Safety Conditions", text: "Sponsor is explicitly restricted from administering doses exceeding 50mg daily pending submission of 6-month primate neuro-toxicity reports." }
        ],
        entities: {
          financial: ["$0 Regulatory Penalty to date"],
          dates: ["September 08, 2026", "48-Hour Event Notification Window"],
          parties: ["Food and Drug Administration (FDA)", "Dr. Aris Thorne (Lead Reviewer)"],
          obligations: ["Strict 50mg dosage limitation", "Quarterly DSMB safety submission"]
        }
      },
      {
        id: "doc-c3",
        name: "DSMB_Patient_Safety_Q2_Report.xlsx",
        type: "xlsx",
        size: "1.2 MB",
        pages: 8,
        date: "Sep 28, 2026",
        department: "Medical Monitoring",
        author: "Independent DSMB Committee",
        status: "Analyzed",
        health: 72,
        summary: "Data Safety Monitoring Board review of 480 enrolled participants. Identifies 3 non-life threatening tachycardia events and flags missing trial physician signature.",
        keyTakeaways: [
          "Total enrolled patients: 480 (Cohort A: 160, Cohort B: 160, Cohort C: 160).",
          "Three Grade 2 tachycardia occurrences documented in Cohort C.",
          "Report missing required formal signature from Site Principal Investigator Dr. Chen."
        ],
        snippets: [
          { page: 6, section: "Verification Tab", text: "Site #104 (Zurich): Principal Investigator Dr. Chen signature status marked PENDING as of Sept 28." }
        ],
        entities: {
          financial: ["$45,000 Patient Stipends"],
          dates: ["September 28, 2026"],
          parties: ["DSMB Chair Dr. Sarah Lind", "Dr. Chen (Site #104 PI)"],
          obligations: ["Site PI signature within 5 business days"]
        }
      }
    ],
    conflicts: [
      {
        id: "c-conf-1",
        severity: "CRITICAL",
        category: "Patient Safety & FDA Compliance",
        title: "Dosage Ceiling Contradiction (75mg Protocol vs 50mg FDA Mandate)",
        description: "Clinical Protocol v2 allows titration up to 75mg daily, whereas the FDA IND Authorization explicitly restricts dosing to a maximum of 50mg pending toxicology findings.",
        impact: "Severe regulatory risk; potential clinical hold by FDA if 75mg dosing occurs at clinical trial sites.",
        docA: {
          name: "Phase_III_CardioVax_Clinical_Protocol_v2.pdf",
          page: 24,
          quote: "Cohort C subjects shall receive daily escalated titration up to a maximum ceiling of 75mg daily."
        },
        docB: {
          name: "FDA_Investigational_New_Drug_IND_Notice.docx",
          page: 3,
          quote: "Sponsor is explicitly restricted from administering doses exceeding 50mg daily..."
        },
        aiRecommendation: "Immediately issue Protocol Amendment 2.1 capping Cohort C at 50mg and notify all 14 clinical trial site monitors via urgent circular."
      }
    ],
    missingInformation: [
      {
        id: "c-miss-1",
        urgency: "HIGH",
        category: "Clinical Regulatory",
        item: "Missing Principal Investigator Sign-off on Site #104 Safety Log",
        reference: "DSMB Q2 Safety Report, Page 6",
        explanation: "Good Clinical Practice (GCP) guidelines mandate PI verification of adverse tachycardia events within 7 days.",
        action: "Trigger immediate electronic signature request to Dr. Chen."
      }
    ],
    actions: [
      {
        id: "c-act-1",
        priority: "HIGH",
        category: "Regulatory Notice",
        title: "Dispatch Urgent Clinical Bulletin Capping Dose at 50mg",
        due: "IMMEDIATE (Today)",
        impact: "Avoids FDA clinical hold and protects participant safety",
        type: "memo",
        actionBtnText: "Generate Protocol Amendment Directive",
        content: `URGENT REGULATORY DIRECTIVE - PROTOCOL AMENDMENT 2.1\n\nTO: All Principal Investigators & Clinical Research Coordinators\nFROM: Regulatory Affairs Directorate\n\nEFFECTIVE IMMEDIATELY: Under FDA CDER directive IND-99214, the daily maximum dosage for CardioVax in Cohort C is capped at 50mg.\n\nAny titration above 50mg is prohibited. Please update your electronic data capture (EDC) limits immediately.`
      }
    ],
    knowledgeGraph: {
      nodes: [
        { id: "c-proto", label: "CardioVax Protocol v2", type: "document", group: "doc", size: 26, color: "#2563EB" },
        { id: "c-fda", label: "FDA IND Notice", type: "document", group: "doc", size: 26, color: "#2563EB" },
        { id: "c-dsmb", label: "DSMB Q2 Safety Report", type: "document", group: "doc", size: 22, color: "#2563EB" },
        { id: "c-diff-dose", label: "Dosage Ceiling Conflict (75mg vs 50mg)", type: "conflict", group: "conflict", size: 26, color: "#EF4444" },
        { id: "c-miss-sign", label: "Missing PI Signature", type: "missing", group: "missing", size: 22, color: "#8B5CF6" },
        { id: "c-50mg", label: "50mg FDA Cap", type: "entity", group: "entity", size: 18, color: "#10B981" },
        { id: "c-75mg", label: "75mg Protocol Target", type: "entity", group: "entity", size: 18, color: "#F59E0B" }
      ],
      links: [
        { source: "c-proto", target: "c-diff-dose", label: "specifies 75mg", style: "dashed" },
        { source: "c-fda", target: "c-diff-dose", label: "mandates 50mg", style: "dashed" },
        { source: "c-dsmb", target: "c-miss-sign", label: "flags missing sign-off", style: "solid" },
        { source: "c-fda", target: "c-50mg", label: "regulates", style: "solid" },
        { source: "c-proto", target: "c-75mg", label: "outlines", style: "solid" }
      ]
    },
    comparisonMatrix: {
      documents: [
        "Phase_III_CardioVax_Clinical_Protocol_v2.pdf",
        "FDA_Investigational_New_Drug_IND_Notice.docx",
        "DSMB_Patient_Safety_Q2_Report.xlsx"
      ],
      dimensions: [
        {
          name: "Maximum Daily Titration Dose",
          TitanAcq: "75mg Daily (Cohort C)",
          ApexVendor: "50mg Strict Maximum Limit",
          InternalAudit: "Subjects monitored up to 50mg",
          BoardMemo: "-",
          status: "conflict"
        },
        {
          name: "Adverse Event Escalation SLA",
          TitanAcq: "7 calendar days",
          ApexVendor: "48 hours mandatory",
          InternalAudit: "Reported at 5 business days",
          BoardMemo: "-",
          status: "conflict"
        },
        {
          name: "DSMB Independence Mandate",
          TitanAcq: "Quarterly review required",
          ApexVendor: "Unblinded external board required",
          InternalAudit: "Convened Sept 28, 2026",
          BoardMemo: "-",
          status: "aligned"
        }
      ]
    }
  },

  cloud_sla_audit: {
    id: "cloud_sla_audit",
    name: "Enterprise Cloud Infrastructure & SLA Audit",
    badge: "Cloud & DevOps",
    description: "Multi-document forensic audit cross-referencing Master Cloud SLA commitments, Q3 Major Incident Post-Mortem, and monthly enterprise cloud billing schedules.",
    tagline: "Identified 99.82% SLA breach qualifying enterprise for $142,000 service credit rebate.",
    healthScore: {
      overall: 88,
      grade: "A-",
      status: "High Reliability",
      summary: "Accurate incident tracking, but unexercised SLA service credit claim requires financial recoupment prior to 30-day filing window.",
      pillars: [
        { name: "Completeness", score: 94, benchmark: 95, detail: "All outage logs and MTTR metrics documented" },
        { name: "Consistency", score: 82, benchmark: 98, detail: "Vendor bill omits automatic 15% SLA rebate" },
        { name: "Accuracy", score: 96, benchmark: 90, detail: "Prometheus & Datadog telemetry verified" },
        { name: "Recency", score: 95, benchmark: 85, detail: "Data captured in current billing cycle" },
        { name: "Actionability", score: 85, benchmark: 90, detail: "Rebate claim workflow ready for submission" }
      ]
    },
    documents: [
      {
        id: "doc-s1",
        name: "Global_Cloud_Enterprise_SLA_Agreement.pdf",
        type: "pdf",
        size: "2.8 MB",
        pages: 32,
        date: "Jan 10, 2026",
        department: "Infrastructure / Procurement",
        author: "HyperScale Cloud Services Legal",
        status: "Analyzed",
        health: 94,
        summary: "Enterprise Master Cloud Services Agreement guaranteeing 99.99% monthly uptime across US-East and EU-West regions with tiered service credit penalties.",
        keyTakeaways: [
          "Contracted monthly uptime guarantee: 99.99% (less than 4.38 minutes downtime/month).",
          "If uptime falls below 99.90%, client is entitled to 15% billing credit.",
          "Service credit claims must be submitted within 30 days of month-end."
        ],
        snippets: [
          { page: 8, section: "Section 3.2 (Service Credit Tier)", text: "For monthly availability between 99.80% and 99.90%, Provider shall grant a 15% credit against the applicable monthly service fee." }
        ],
        entities: {
          financial: ["15% Service Credit", "$950,000 Monthly Cloud Commitment"],
          dates: ["30-Day Claim Submission Window"],
          parties: ["HyperScale Cloud Inc.", "Enterprise Tech Corp"],
          obligations: ["99.99% High Availability", "Automated root cause analysis within 72 hrs"]
        }
      },
      {
        id: "doc-s2",
        name: "Q3_Incident_Outage_PostMortem.docx",
        type: "docx",
        size: "940 KB",
        pages: 16,
        date: "Oct 01, 2026",
        department: "Site Reliability Engineering",
        author: "DevOps Core Incident Response",
        status: "Analyzed",
        health: 90,
        summary: "Comprehensive technical post-mortem of September 18 BGP routing cascading failure in US-East datacenter. Records 78 minutes of total service unavailability.",
        keyTakeaways: [
          "Total outage duration recorded as 78 minutes on September 18, 2026.",
          "Net calculated availability for September 2026: 99.819% (rounded to 99.82%).",
          "Impact affected payment gateway and user authentication APIs."
        ],
        snippets: [
          { page: 4, section: "Downtime Summary", text: "Total downtime incurred was 78 minutes, yielding an effective monthly availability of 99.82% for September 2026." }
        ],
        entities: {
          financial: ["$0 Direct Data Loss"],
          dates: ["September 18, 2026", "October 01, 2026"],
          parties: ["SRE Incident Commander Lisa Ray"],
          obligations: ["Redundant multi-region failover testing"]
        }
      },
      {
        id: "doc-s3",
        name: "Infrastructure_Billing_Cost_Allocation.xlsx",
        type: "xlsx",
        size: "1.5 MB",
        pages: 6,
        date: "Oct 03, 2026",
        department: "Finance / FinOps",
        author: "FinOps Infrastructure Manager",
        status: "Analyzed",
        health: 86,
        summary: "Invoice reconciliation showing full billing charge of $946,666 for September 2026 without any SLA service credit applied by HyperScale Cloud.",
        keyTakeaways: [
          "Total September invoice received: $946,666.67.",
          "Zero service credit applied by vendor automatically.",
          "Potential rebate recovery: $142,000.00 (15% of monthly bill)."
        ],
        snippets: [
          { page: 2, section: "Invoice Summary Tab", text: "Total Gross Billed: $946,666.67. Applied SLA Discounts: $0.00. Payment scheduled Oct 25." }
        ],
        entities: {
          financial: ["$946,666.67 Gross Invoice", "$142,000.00 Eligible Credit"],
          dates: ["October 25, 2026 (Scheduled Payment)"],
          parties: ["FinOps Treasury", "HyperScale Accounts Receivable"],
          obligations: ["Claim submission before October 31, 2026"]
        }
      }
    ],
    conflicts: [
      {
        id: "s-conf-1",
        severity: "HIGH",
        category: "Contractual SLA & Billing",
        title: "SLA Uptime Breach vs. Uncredited Full Billing Invoice",
        description: "Post-Mortem documents 99.82% monthly uptime (breaching 99.99% SLA and triggering 15% credit tier), but September Cloud Invoice bills the full $946,666 without credit.",
        impact: "Forfeiture of $142,000 in legally owed cloud credits if claim is not submitted before October 31.",
        docA: {
          name: "Q3_Incident_Outage_PostMortem.docx",
          page: 4,
          quote: "Total downtime incurred was 78 minutes, yielding an effective monthly availability of 99.82%..."
        },
        docB: {
          name: "Infrastructure_Billing_Cost_Allocation.xlsx",
          page: 2,
          quote: "Applied SLA Discounts: $0.00. Total Gross Billed: $946,666.67."
        },
        aiRecommendation: "Submit formal SLA Credit Claim Notice requesting immediate $142,000 credit deduction prior to payment release on October 25."
      }
    ],
    missingInformation: [
      {
        id: "s-miss-1",
        urgency: "MEDIUM",
        category: "Disaster Recovery",
        item: "Missing Annual Multi-Region Failover Drill Certification",
        reference: "Cloud SLA Agreement, Section 7.4",
        explanation: "Agreement requires provider to submit proof of semi-annual chaos testing drill, which is absent from compliance log.",
        action: "Request technical audit certificate from Cloud Account Executive."
      }
    ],
    actions: [
      {
        id: "s-act-1",
        priority: "HIGH",
        category: "FinOps Recovery",
        title: "Submit $142,000 SLA Credit Claim to HyperScale Cloud",
        due: "Before Oct 20, 2026",
        impact: "Recovers $142,000 in uncredited cloud expenditure",
        type: "email",
        actionBtnText: "Generate SLA Credit Claim Letter",
        content: `FORMAL NOTICE OF SERVICE LEVEL AGREEMENT CREDIT CLAIM\n\nTO: HyperScale Cloud Services Billing & Account Team\nRE: Enterprise Account #HS-40912 - September 2026 Availability Breach\n\nPursuant to Section 3.2 of the Enterprise Cloud SLA, client is entitled to a 15% billing credit for monthly availability between 99.80% and 99.90%.\n\nPer the verified incident post-mortem for the September 18 BGP outage (78 minutes downtime), measured availability was 99.82%.\n\nWe request the immediate application of a $142,000.00 service credit against September Invoice #INV-88301 prior to remittance.`
      }
    ],
    knowledgeGraph: {
      nodes: [
        { id: "s-sla", label: "Cloud SLA Agreement", type: "document", group: "doc", size: 26, color: "#2563EB" },
        { id: "s-post", label: "Q3 Outage PostMortem", type: "document", group: "doc", size: 26, color: "#2563EB" },
        { id: "s-bill", label: "Billing Allocation", type: "document", group: "doc", size: 22, color: "#2563EB" },
        { id: "s-diff-cred", label: "Uncredited $142K Rebate", type: "conflict", group: "conflict", size: 26, color: "#EF4444" },
        { id: "s-9982", label: "99.82% Actual Uptime", type: "entity", group: "entity", size: 18, color: "#F59E0B" },
        { id: "s-9999", label: "99.99% SLA Guaranteed", type: "entity", group: "entity", size: 18, color: "#10B981" },
        { id: "s-claim", label: "30-Day Claim Window", type: "missing", group: "missing", size: 20, color: "#8B5CF6" }
      ],
      links: [
        { source: "s-post", target: "s-diff-cred", label: "documents 78m outage", style: "dashed" },
        { source: "s-bill", target: "s-diff-cred", label: "charges full $946K", style: "dashed" },
        { source: "s-sla", target: "s-9999", label: "guarantees", style: "solid" },
        { source: "s-post", target: "s-9982", label: "measured", style: "solid" },
        { source: "s-sla", target: "s-claim", label: "stipulates", style: "solid" }
      ]
    },
    comparisonMatrix: {
      documents: [
        "Global_Cloud_Enterprise_SLA_Agreement.pdf",
        "Q3_Incident_Outage_PostMortem.docx",
        "Infrastructure_Billing_Cost_Allocation.xlsx"
      ],
      dimensions: [
        {
          name: "Guaranteed vs Actual Monthly Uptime",
          TitanAcq: "99.99% Guaranteed (<=4.38 min downtime)",
          ApexVendor: "99.82% Actual (78 min downtime)",
          InternalAudit: "Financial impact: $142K breach tier",
          BoardMemo: "-",
          status: "conflict"
        },
        {
          name: "Applied Service Credit Percentage",
          TitanAcq: "15% Mandatory Tiered Credit",
          ApexVendor: "Breached threshold documented",
          InternalAudit: "0% Applied on Current Invoice ($0.00)",
          BoardMemo: "-",
          status: "conflict"
        },
        {
          name: "Incident Response Time SLA",
          TitanAcq: "Severity 1: 15 minutes",
          ApexVendor: "Acknowledged within 8 minutes",
          InternalAudit: "Audit compliant",
          BoardMemo: "-",
          status: "aligned"
        }
      ]
    }
  }
};
