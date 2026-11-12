import { createPatientSchema, patientListQuerySchema } from '@pmd/shared';
import { Router } from 'express';
import type { PatientService } from './patient.service.js';

export function createPatientController(service: PatientService) {
  const router = Router();

  router.param('id', (request, response, next, id: string) => {
    if (!/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(id)) {
      response.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invalid patient ID.' } });
      return;
    }
    request.params.id = id.toLowerCase();
    next();
  });

  router.get('/', async (request, response) => {
    const query = patientListQuerySchema.safeParse(request.query);
    if (!query.success) {
      response
        .status(400)
        .json({ error: { code: 'BAD_REQUEST', message: 'Invalid patient query.' } });
      return;
    }
    response.json(await service.list(query.data));
  });

  router.get('/:id', async (request, response) => {
    const patient = await service.get(String(request.params.id));
    if (!patient) {
      response
        .status(404)
        .json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
      return;
    }
    response.json({ data: patient });
  });

  router.post('/', async (request, response) => {
    const parsed = createPatientSchema.safeParse(request.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues)
        (fieldErrors[issue.path.join('.') || '_form'] ??= []).push(issue.message);
      response.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Check the highlighted fields.',
          fieldErrors,
        },
      });
      return;
    }
    response.status(201).json({ data: await service.create(parsed.data) });
  });

  router.put('/:id', async (request, response) => {
    const parsed = createPatientSchema.safeParse(request.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues)
        (fieldErrors[issue.path.join('.') || '_form'] ??= []).push(issue.message);
      response.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Check the highlighted fields.',
          fieldErrors,
        },
      });
      return;
    }
    const patient = await service.update(String(request.params.id), parsed.data);
    if (!patient) {
      response
        .status(404)
        .json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
      return;
    }
    response.json({ data: patient });
  });

  return router;
}
