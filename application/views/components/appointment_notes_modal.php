<div id="appointment-notes-modal" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center flex-wrap gap-2">
                    <h4 class="modal-title mb-0">
                        <i class="fas fa-notes-medical me-2 text-primary"></i>
                        <span id="appointment-notes-title"><?= lang('session_notes') ?></span>
                    </h4>
                    <div id="notes-queue-nav" class="d-none align-items-center ms-2 border rounded px-2 py-1 bg-light">
                        <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2 me-2" id="btn-prev-note" title="Previous appointment">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span id="notes-queue-counter" class="fw-bold small text-muted user-select-none">1 of 1</span>
                        <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2 ms-2" id="btn-next-note" title="Next appointment">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="modal-message alert d-none"></div>

                <!-- Info summary -->
                <div class="bg-light p-3 rounded mb-3 border">
                    <div class="row">
                        <div class="col-sm-6 mb-2">
                            <strong>Client:</strong> <span id="note-client-name">-</span>
                        </div>
                        <div class="col-sm-6 mb-2">
                            <strong>Service:</strong> <span id="note-service-name">-</span>
                        </div>
                        <div class="col-sm-6">
                            <strong>Date/Time:</strong> <span id="note-datetime">-</span>
                        </div>
                        <div class="col-sm-6">
                            <strong>Practitioner:</strong> <span id="note-provider-name">-</span>
                        </div>
                    </div>
                </div>

                <form id="appointment-notes-form">
                    <input type="hidden" id="note-appointment-id" value="">
                    <input type="hidden" id="note-customer-id" value="">

                    <div class="mb-3">
                        <label for="note-content" class="form-label fw-bold">
                            <?= lang('session_notes') ?>:
                        </label>
                        <textarea id="note-content" class="form-control" rows="8" placeholder="Enter clinical notes, treatment observations, recommendations, or session progress..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer d-flex justify-content-between">
                <div>
                    <a id="btn-print-client-notes" href="#" target="_blank" class="btn btn-outline-secondary d-none">
                        <i class="fas fa-print me-1"></i> <?= lang('print_all_notes') ?>
                    </a>
                </div>
                <div>
                    <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                        <?= lang('cancel') ?>
                    </button>
                    <button type="button" id="btn-save-appointment-notes" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> <?= lang('save_notes') ?>
                    </button>
                    <button type="button" id="btn-save-and-next-note" class="btn btn-primary d-none">
                        <i class="fas fa-forward me-1"></i> <span id="btn-save-and-next-text"><?= lang('save_and_next') ?></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
