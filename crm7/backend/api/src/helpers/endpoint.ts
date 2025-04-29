import { type NextApiRequest, type NextApiResponse } from 'next';

export type APIHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export interface APIEndpoint {
  handler: APIHandler;
  methods: string[];
}
