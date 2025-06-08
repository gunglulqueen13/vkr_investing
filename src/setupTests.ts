import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Моки для API
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());