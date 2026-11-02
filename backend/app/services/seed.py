from datetime import datetime, timedelta, timezone
from backend.app.core.database import SessionLocal, engine, Base
from backend.app.models.entities import (
    CustomerOrder,
    SubcontractJob,
    SubcontractDispatch,
    VendorExternalEvent,
    WarehouseReceipt,
    QualityInspection,
    VendorInvoice,
    ActivityLog,
    User,
    generate_uuid,
    get_utc_now
)
from backend.app.core.security import hash_password
from backend.app.core.config import settings

def seed_scenario():
    """
    Idempotent seed script setting up the exact assessment scenario.
    """
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_order = db.query(CustomerOrder).filter(CustomerOrder.order_number == "CO-2026-TATA-1001").first()
        if existing_order:
            print("[SEED] Scenario data already exists. Resetting for fresh baseline...")
            db.query(ActivityLog).delete()
            db.query(QualityInspection).delete()
            db.query(WarehouseReceipt).delete()
            db.query(VendorInvoice).delete()
            db.query(VendorExternalEvent).delete()
            db.query(SubcontractDispatch).delete()
            db.query(SubcontractJob).delete()
            db.query(CustomerOrder).delete()
            db.commit()

        now = datetime.now(timezone.utc)
        due_date = now + timedelta(days=2) # Customer shipment due in two days

        # 1. Customer Order (1,000 required, due in 2 days)
        customer_order = CustomerOrder(
            id=generate_uuid(),
            order_number="CO-2026-TATA-1001",
            customer_name="Tata Motors Ltd (CV Division, Pune)",
            part_name="Pinion Gear Shaft - Spec 20MnCr5",
            required_quantity=1000,
            due_date=due_date,
            status="IN_PROGRESS",
            created_at=now - timedelta(days=4)
        )
        db.add(customer_order)

        # 2. Subcontract Job
        job = SubcontractJob(
            id=generate_uuid(),
            customer_order_id=customer_order.id,
            job_number="SCJ-2026-HT-088",
            vendor_name="Apex Heat Treaters Pvt Ltd, Bhosari MIDC",
            process_name="Atmospheric Gas Carburizing & Case Hardening (58-62 HRC)",
            status="ACTIVE",
            created_at=now - timedelta(days=3, hours=12)
        )
        db.add(job)

        # 3. Manufacturer Dispatched 1,000 components
        dispatch = SubcontractDispatch(
            id=generate_uuid(),
            subcontract_job_id=job.id,
            dispatch_number="MFR-DSP-2026-001",
            quantity=1000,
            sender_name="Sunil R. (Production Dispatch Supervisor)",
            dispatched_at=now - timedelta(days=3),
            remarks="1,000 raw machined pinion gear shafts dispatched in 10 crates via company truck."
        )
        db.add(dispatch)

        # 4. Vendor Reports Dispatching 800 components back
        vendor_event = VendorExternalEvent(
            id=generate_uuid(),
            subcontract_job_id=job.id,
            external_event_id="VENDOR-DISPATCH-001",
            event_type="DISPATCH_UPDATE",
            reported_quantity=800,
            vendor_name="Apex Heat Treaters Pvt Ltd",
            status="PROCESSED",
            payload_json='{"event_id": "VENDOR-DISPATCH-001", "reported_quantity": 800, "challan_ref": "AHT/26/1044", "carrier": "Apex Logistics"}',
            error_message=None,
            attempt_count=1,
            processed_at=now - timedelta(days=1, hours=8)
        )
        db.add(vendor_event)

        # 5. Warehouse physically receives 780 components
        receipt = WarehouseReceipt(
            id=generate_uuid(),
            subcontract_job_id=job.id,
            receipt_number="GRN-2026-DOCK-780",
            received_quantity=780,
            received_by="Ramesh K. (Warehouse Inward Dock)",
            received_at=now - timedelta(hours=20),
            remarks="Physical count at goods receiving dock: 780 units received. Discrepancy of 20 units noted against vendor delivery challan (800 claimed)."
        )
        db.add(receipt)

        # 6. Quality Inspection: 740 accepted, 40 rejected for possible rework
        inspection = QualityInspection(
            id=generate_uuid(),
            warehouse_receipt_id=receipt.id,
            inspection_number="QC-2026-INSP-040",
            inspected_quantity=780,
            accepted_quantity=740,
            rejected_quantity=40,
            inspector_name="S. Verma (Lead Quality Inspector)",
            rejection_reason="Surface decarburization on 40 units; case depth out of tolerance. Quarantined in Yellow Bay for rework review.",
            status="COMPLETED",
            inspected_at=now - timedelta(hours=14)
        )
        db.add(inspection)

        # 7. Vendor invoices for treating 800 components
        invoice = VendorInvoice(
            id=generate_uuid(),
            subcontract_job_id=job.id,
            invoice_number="INV-APEX-2026-884",
            invoiced_quantity=800,
            unit_rate=45.0,
            total_amount=36000.0,
            reconciliation_status="DISCREPANCY_FLAGGED",
            flagged_reason="Billed 800 units vs 780 physical dock receipt (-20 units) and 740 QA accepted stock (-60 units).",
            action_note="Awaiting credit note or vendor confirmation before approving payment voucher.",
            reconciled_by="Amit P. (Senior Cost Accountant)",
            reconciled_at=now - timedelta(hours=8),
            created_at=now - timedelta(hours=12)
        )
        db.add(invoice)

        # 8. Chronological Activity Logs (Historical baseline)
        logs = [
            ActivityLog(
                id=generate_uuid(),
                subcontract_job_id=job.id,
                action_type="DISPATCH_RECORDED",
                actor="Manufacturer (Production Dispatch)",
                description="Subcontract dispatch MFR-DSP-2026-001 created. 1,000 pinion shafts sent to Apex Heat Treaters.",
                quantity_affected=1000,
                status="SUCCESS",
                created_at=now - timedelta(days=3)
            ),
            ActivityLog(
                id=generate_uuid(),
                subcontract_job_id=job.id,
                action_type="VENDOR_UPDATE_IMPORTED",
                actor="External Vendor EDI / Integration",
                description="Vendor reported dispatch update VENDOR-DISPATCH-001 (800 units returned under challan AHT/26/1044).",
                quantity_affected=800,
                status="SUCCESS",
                created_at=now - timedelta(days=1, hours=8)
            ),
            ActivityLog(
                id=generate_uuid(),
                subcontract_job_id=job.id,
                action_type="WAREHOUSE_RECEIPT_RECORDED",
                actor="Warehouse Inward Dock (Ramesh K.)",
                description="Goods Receipt Note GRN-2026-DOCK-780 created. 780 units physically counted. Discrepancy of 20 units flagged.",
                quantity_affected=780,
                status="SUCCESS",
                created_at=now - timedelta(hours=20)
            ),
            ActivityLog(
                id=generate_uuid(),
                subcontract_job_id=job.id,
                action_type="QUALITY_INSPECTION_RECORDED",
                actor="Quality Assurance (S. Verma)",
                description="Inspection QC-2026-INSP-040 finalized: 740 units accepted into usable stock, 40 units quarantined for rework.",
                quantity_affected=740,
                status="SUCCESS",
                created_at=now - timedelta(hours=14)
            ),
            ActivityLog(
                id=generate_uuid(),
                subcontract_job_id=job.id,
                action_type="INVOICE_RECONCILIATION_ACTION",
                actor="Cost Accountant (Amit P.)",
                description="Invoice INV-APEX-2026-884 flagged with discrepancy. Billed 800 vs 780 physical received (-20 units variance).",
                quantity_affected=800,
                status="SUCCESS",
                created_at=now - timedelta(hours=8)
            )
        ]
        for log in logs:
            db.add(log)

        # 8. Seed Super Admin User (Idempotent: Only creates if no admin user exists)
        existing_admin = db.query(User).filter(
            (User.email == settings.SEED_ADMIN_EMAIL) | 
            (User.username == settings.SEED_ADMIN_USERNAME) |
            (User.role == "SUPER_ADMIN")
        ).first()

        if not existing_admin:
            # In production, require an explicit, non-default password
            if settings.ENVIRONMENT.lower() == "production":
                if not settings.SEED_ADMIN_PASSWORD or settings.SEED_ADMIN_PASSWORD == "Admin@123456":
                    print("[SECURITY] In production, SEED_ADMIN_PASSWORD must be configured via environment variable. Skipping admin creation.")
                else:
                    super_admin = User(
                        id=generate_uuid(),
                        email=settings.SEED_ADMIN_EMAIL,
                        username=settings.SEED_ADMIN_USERNAME,
                        hashed_password=hash_password(settings.SEED_ADMIN_PASSWORD),
                        full_name="System Super Admin (Plant Controller)",
                        role="SUPER_ADMIN",
                        is_active=1,
                        created_at=now
                    )
                    db.add(super_admin)
                    print(f"[SEED] Initialized production super admin profile: {settings.SEED_ADMIN_USERNAME}")
            else:
                # Non-production (development, demo, testing)
                super_admin = User(
                    id=generate_uuid(),
                    email=settings.SEED_ADMIN_EMAIL,
                    username=settings.SEED_ADMIN_USERNAME,
                    hashed_password=hash_password(settings.SEED_ADMIN_PASSWORD),
                    full_name="System Super Admin (Plant Controller)",
                    role="SUPER_ADMIN",
                    is_active=1,
                    created_at=now
                )
                db.add(super_admin)
                print(f"[SEED] Initialized environment-controlled admin profile: {settings.SEED_ADMIN_USERNAME}")
        else:
            print(f"[SEED] Administrator profile '{existing_admin.username}' already exists. Preserving existing password and credentials.")

        db.commit()
        print("[SEED] Successfully seeded exact assessment scenario into database:")
        print("  - Customer Order: 1,000 units (Due in 2 days)")
        print("  - Sent to Vendor: 1,000 units")
        print("  - Vendor Reported Dispatch: 800 units")
        print("  - Warehouse Physical Receipt: 780 units")
        print("  - Quality Accepted: 740 units")
        print("  - Quality Rejected (Rework): 40 units")
        print("  - Vendor Invoiced: 800 units")
        print("  - Shortfall against customer order: 260 units")
    finally:
        db.close()

if __name__ == "__main__":
    seed_scenario()

