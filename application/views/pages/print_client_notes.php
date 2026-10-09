<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($customer['first_name'] . ' ' . $customer['last_name']) ?> - Clinical Notes Summary</title>
    <link rel="stylesheet" href="<?= asset_url('assets/vendor/bootstrap/bootstrap.min.css') ?>">
    <link rel="stylesheet" href="<?= asset_url('assets/vendor/fontawesome/fontawesome.min.css') ?>">
    <style>
        body {
            background-color: #f8f9fa;
            color: #212529;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 14px;
        }

        .print-container {
            max-width: 900px;
            margin: 30px auto;
            background: #fff;
            padding: 40px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .header-section {
            border-bottom: 2px solid #0d6efd;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }

        .clinic-title {
            font-size: 24px;
            font-weight: 700;
            color: #0d6efd;
            margin: 0;
        }

        .client-info-card {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px 20px;
            margin-bottom: 30px;
        }

        .session-card {
            border: 1px solid #dee2e6;
            border-left: 4px solid #0d6efd;
            border-radius: 4px;
            padding: 18px 20px;
            margin-bottom: 20px;
            background: #fff;
            break-inside: avoid;
        }

        .session-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }

        .session-date {
            font-size: 16px;
            font-weight: 600;
            color: #212529;
        }

        .session-meta {
            font-size: 13px;
            color: #6c757d;
        }

        .session-notes-body {
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            color: #333;
        }

        @media print {
            body {
                background: #fff !important;
                color: #000 !important;
            }

            .print-container {
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
            }

            .no-print {
                display: none !important;
            }

            .session-card {
                border: 1px solid #ccc !important;
                border-left: 4px solid #333 !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
            }

            .clinic-title {
                color: #000 !important;
            }

            .header-section {
                border-bottom: 2px solid #000 !important;
            }
        }
    </style>
</head>
<body>

<div class="print-container">
    <!-- Action Controls (Hidden on Print) -->
    <div class="no-print d-flex justify-content-between align-items-center mb-4">
        <button type="button" onclick="if (window.opener || window.history.length <= 1) { window.close(); } else { window.history.back(); }" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-1"></i> Close / Back
        </button>
        <div>
            <button onclick="window.print()" class="btn btn-primary">
                <i class="fas fa-print me-1"></i> Print Summary
            </button>
        </div>
    </div>

    <!-- Header / Clinic Info -->
    <div class="header-section">
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h1 class="clinic-title"><?= htmlspecialchars($company['company_name'] ?: 'Clinical Notes') ?></h1>
                <?php if (!empty($company['company_email'])): ?>
                    <div class="text-muted small"><?= htmlspecialchars($company['company_email']) ?></div>
                <?php endif; ?>
                <?php if (!empty($company['company_link'])): ?>
                    <div class="text-muted small"><?= htmlspecialchars($company['company_link']) ?></div>
                <?php endif; ?>
            </div>
            <div class="text-end">
                <h4 class="mb-1 text-secondary">Client Notes Summary</h4>
                <div class="text-muted small">Generated: <?= date('Y-m-d H:i') ?></div>
            </div>
        </div>
    </div>

    <!-- Client Demographics -->
    <div class="client-info-card">
        <div class="row">
            <div class="col-md-6">
                <strong>Client Name:</strong>
                <span><?= htmlspecialchars(trim($customer['first_name'] . ' ' . $customer['last_name'])) ?></span>
                <br>
                <strong>Email:</strong>
                <span><?= htmlspecialchars($customer['email'] ?: '—') ?></span>
                <br>
                <strong>Phone:</strong>
                <span><?= htmlspecialchars($customer['phone_number'] ?: '—') ?></span>
            </div>
            <div class="col-md-6">
                <strong>Address:</strong>
                <span><?= htmlspecialchars($customer['address'] ?: '—') ?></span>
                <?php if (!empty($customer['city'])): ?>
                    <br><strong>City/Zip:</strong>
                    <span><?= htmlspecialchars($customer['city'] . ($customer['zip_code'] ? ' ' . $customer['zip_code'] : '')) ?></span>
                <?php endif; ?>
                <br>
                <strong>Total Recorded Sessions:</strong>
                <span><?= count($notes) ?></span>
            </div>
        </div>
    </div>

    <!-- Session Notes List -->
    <h4 class="mb-3">Session History</h4>

    <?php if (empty($notes)): ?>
        <div class="alert alert-light border text-muted p-4 text-center">
            No session notes recorded for this client.
        </div>
    <?php else: ?>
        <?php foreach ($notes as $item): ?>
            <div class="session-card">
                <div class="session-header">
                    <div>
                        <span class="session-date">
                            <?= date('F j, Y - g:i A', strtotime($item['start_datetime'] ?: $item['note_date'])) ?>
                        </span>
                        <?php if (!empty($item['service_name'])): ?>
                            <span class="badge bg-secondary ms-2"><?= htmlspecialchars($item['service_name']) ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="session-meta">
                        <?php if (!empty($item['provider_first_name'])): ?>
                            <strong>Practitioner:</strong>
                            <?= htmlspecialchars($item['provider_first_name'] . ' ' . $item['provider_last_name']) ?>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="session-notes-body"><?= htmlspecialchars($item['session_notes']) ?></div>

                <?php if (!empty($item['booking_notes'])): ?>
                    <div class="mt-3 pt-2 border-top text-muted small">
                        <strong>Booking Note / Reason:</strong> <?= htmlspecialchars($item['booking_notes']) ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>

    <div class="mt-5 pt-3 border-top text-center text-muted small">
        <?= htmlspecialchars($company['company_name'] ?: 'Easy!Appointments') ?> &bull; Confidential Medical / Clinical Record
    </div>
</div>

</body>
</html>
