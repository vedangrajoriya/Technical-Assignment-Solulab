# Manufacturing ERP Subcontracting Research

> **Task 1 Requirement:** Research how two existing manufacturing ERP products handle external subcontracting workflows, cite official documentation sources, distinguish verified documented capabilities from interpretations, and explain what influenced this prototype solution.

---

## 1. Product 1: Odoo Manufacturing & Inventory (Subcontracting Workflow)

### 1.1 Official Source Reference
- **Source:** Odoo Official Documentation (MRP / Subcontracting)  
- **Direct Link:** [Odoo Subcontracting Documentation](https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/manufacturing/subcontracting.html)
- **Quality Control Links:** [Odoo Quality Management](https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/quality.html)
- **Vendor Bills / 3-Way Matching:** [Odoo Vendor Bill Matching](https://www.odoo.com/documentation/17.0/applications/finance/accounting/vendor_bills.html)

### 1.2 Documented Workflow & Capabilities
In Odoo, external processing (such as heat treatment, plating, or machining) is managed through **Subcontracting Bills of Materials (BoMs)** and **Resupply Subcontractor Rules**:
1. **Material Dispatch to Subcontractor:**
   - Raw materials or semi-finished components are transferred to a designated physical or virtual stock location (`Subcontractor Location`).
   - A *Resupply Subcontractor* delivery order documents the physical departure of parts from the manufacturer’s primary warehouse.
2. **Vendor Receipt & Processing:**
   - When finished goods return, Odoo generates a Receipt Operation from the subcontractor location back to the internal stock location.
   - Crucially, Odoo's default standard workflow assumes that recording receipt of the finished product will automatically consume raw materials in the subcontractor location based on the BoM ratio.
3. **Quality Checks:**
   - Quality control points can be configured on the *Receipt* operation (Pass/Fail, Measure, Take a Picture).
   - If an item fails inspection, it can be sent to a quarantine location or scrapped via an explicit scrap/rework order.
4. **Vendor Invoicing & 3-Way Matching:**
   - Vendor bills are matched against the purchase order and the received quantities. If billed quantity exceeds received quantity, Odoo raises a warning or blocks automated bill confirmation depending on strict 3-way matching rules.

### 1.3 What We Adopted, Simplified, or Intentionally Excluded
- **Adopted:** 
  - Strict separation of stock locations/states: dispatched components are held in a vendor subcontract state until a formal dock receipt is recorded.
  - Independent Quality Inspection step that gates accepted inventory from entering available stock.
- **Simplified / Intentionally Excluded:**
  - In Odoo, raw material consumption can be automated (*automatic backflushing* upon receipt). In our scenario, we **do not auto-backflush or auto-reconcile**. We preserve the physical dock count (780) vs vendor dispatch report (800) as an active, unresolved variance.
  - We avoided complex multi-tiered BoM configuration to keep the focus squarely on the operations manager's immediate delivery crisis (260-unit shortfall, 2 days remaining).

---

## 2. Product 2: ERPNext Manufacturing & Stock (Subcontracting Module)

### 2.1 Official Source Reference
- **Source:** ERPNext Documentation (Subcontracting Workflow)  
- **Direct Link:** [ERPNext Subcontracting Manual](https://docs.erpnext.com/docs/user/manual/en/subcontracting)
- **Subcontracting Receipt Link:** [ERPNext Subcontracting Receipt](https://docs.erpnext.com/docs/user/manual/en/subcontracting-receipt)
- **Purchase Receipt Inspection:** [ERPNext Quality Inspection](https://docs.erpnext.com/docs/user/manual/en/quality-inspection)

### 2.2 Documented Workflow & Capabilities
ERPNext has a dedicated subcontracting architecture separated into distinct transactional documents:
1. **Subcontracting Order (SCO):**
   - Derived from a Purchase Order marked `Is Subcontracted`. It specifies the finished goods expected from the vendor and the raw components supplied by the manufacturer.
2. **Material Transfer to Subcontractor:**
   - Handled via a `Stock Entry` with purpose `Send to Subcontractor`. This moves inventory to the `Subcontractor Warehouse` (tracking manufacturer inventory residing at external premises).
3. **Subcontracting Receipt (SCR):**
   - When goods return, a `Subcontracting Receipt` is generated. ERPNext records:
     - `Received Qty` (physical items arriving at warehouse).
     - `Accepted Qty` (items that cleared quality check).
     - `Rejected Qty` (items rejected and placed in a rejected warehouse location).
4. **Quality Inspection:**
   - ERPNext allows attaching a `Quality Inspection` document directly to the receipt. The inspection parameters enforce that $Accepted + Rejected = Received$.
5. **Billing (Purchase Invoice):**
   - The invoice can be based on either the ordered quantity, received quantity, or billed directly against the Subcontracting Order. Variances between billed quantity and accepted quantity create accounting provisions (disputed vendor liability).

### 2.3 What We Adopted, Simplified, or Intentionally Excluded
- **Adopted:**
  - ERPNext’s clean segregation of **Received Qty**, **Accepted Qty**, and **Rejected Qty** at the receipt and inspection stage.
  - Explicit quarantine of rejected units: rejected parts (40) are flagged for rework review and strictly prevented from inflating finished usable inventory.
  - Non-auto-filling of physical receipt from vendor dispatch note.
- **Simplified / Intentionally Excluded:**
  - ERPNext requires managing separate scrap warehouses and landed cost vouchers for transport costs. In our prototype, we focus strictly on physical quantity fidelity, delivery risk analysis, and vendor billing reconciliation.

---

## 3. Synthesis: Key Design Influences on Our Prototype

| Requirement Dimension | Odoo Influence | ERPNext Influence | Our Prototype Decision |
| :--- | :--- | :--- | :--- |
| **Material Dispatch** | Resupply transfer order tracking. | Stock Entry to Subcontractor warehouse. | **Manufacturer Dispatch record** tracking 1,000 components committed to heat treatment vendor. |
| **Vendor Return Report** | Vendor EDI / Portal receipt update. | Vendor dispatch challan note. | **Simulated External Vendor Import** with database-enforced idempotency. |
| **Dock Count vs Vendor Claim** | Discrepancy warning on receipt line. | Explicit `Received Qty` field independent of PO. | **Physical Receipt record** (780 counted), highlighting the 20-unit transit loss vs vendor claim (800). |
| **Quality Gating** | Quality control points on receipt. | Inspection criteria with accepted/rejected breakdown. | **Quality Inspection module**: strictly accepted (740) vs rejected (40), isolating rejected stock from customer order availability. |
| **Invoice Reconciliation** | 3-way matching validation rule. | Bill based on Subcontracting Receipt. | **Dual Variance Reconciliation**: clarifies variance against physical receipt (20) vs variance against accepted usable stock (60). |
| **Actionable Risk Visibility** | Standard stock reports. | Production dashboard. | **Dedicated Operations Cockpit**: calculates the exact 260-unit shortfall against the 2-day delivery deadline. |

---

## 4. Verification Note
- All documented features cited above reflect official vendor manual descriptions as of Odoo 17/18 and ERPNext v14/v15.
- The prototype deliberately rejects automatic reconciliation features present in these enterprise systems, because in real-world Indian auto-ancillary manufacturing, silent auto-adjustments mask vendor shortages and jeopardize OEM customer relationships.

