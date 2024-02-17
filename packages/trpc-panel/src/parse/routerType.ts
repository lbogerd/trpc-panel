import { TRPCPanelMetaSchema } from "@src/meta";
import { z } from "zod";

const ZodObjectSchema = z.object({});

export function isZodObject(
  obj: unknown
): obj is z.infer<typeof ZodObjectSchema> {
  return ZodObjectSchema.safeParse(obj).success;
}

const SharedProcedureDefPropertiesSchema = z.object({
  inputs: z.unknown().array(),
  meta: TRPCPanelMetaSchema.optional(),
});

const QueryDefSchema = SharedProcedureDefPropertiesSchema.merge(
  z.object({
    query: z.literal(true),
  })
);

export function isQueryDef(obj: unknown): obj is QueryDef {
  return QueryDefSchema.safeParse(obj).success;
}

type QueryDef = z.infer<typeof QueryDefSchema>;

const MutationDefSchema = SharedProcedureDefPropertiesSchema.merge(
  z.object({
    mutation: z.literal(true),
  })
);

export function isMutationDef(obj: unknown): obj is MutationDef {
  return MutationDefSchema.safeParse(obj).success;
}

export type MutationDef = z.infer<typeof MutationDefSchema>;

const SubscriptionDefSchema = SharedProcedureDefPropertiesSchema.merge(
    z.object({
        subscription: z.literal(true),
    })
);

type SubscriptionDef = z.infer<typeof SubscriptionDefSchema>;

export function isSubscriptionDef(obj: unknown): obj is SubscriptionDef {
    return SubscriptionDefSchema.safeParse(obj).success;
}

export const ProcedureDefSchema = QueryDefSchema.or(MutationDefSchema).or(
    SubscriptionDefSchema
);

export type ProcedureDefSharedProperties = z.infer<
  typeof SharedProcedureDefPropertiesSchema
>;

// Don't export this b/c it's just used to type check, use the is functions
const RouterDefSchema = z.object({
  router: z.literal(true),
});

export type RouterDef = {
  router: true;
  procedures: Record<string, RouterOrProcedure>;
};

export type Router = {
  _def: RouterDef;
} & { [key: string]: Router | Procedure };

const RouterSchema = z.object({
  _def: RouterDefSchema,
});

export function isRouter(obj: unknown): obj is Router {
  let success = RouterSchema.safeParse(obj).success

  if (!success) {
    // this is not exhaustive, but hopefully it's good enough
    // due to error handling in the rest of the code
    // honestly this is basically a very bad hack
    success = isV11Procedure(obj) === false;
  }

  return success;
}

const ProcedureSchema = z.object({
  _def: ProcedureDefSchema,
});

export type Procedure = z.infer<typeof ProcedureSchema>;

export function isProcedure(obj: unknown | Function): obj is Procedure {
  let success = (typeof obj !== "function" || !("_def" in obj)) && ProcedureSchema.safeParse(obj).success;

  if(!success) {
    success = isV11Procedure(obj);
  }

  return success;
}

export function isV11Procedure(obj: unknown): boolean {
  return (obj as any)?._def?.procedure !== undefined;
}

const QuerySchema = z.object({
  _def: QueryDefSchema,
});

export type Query = z.infer<typeof QuerySchema>;

export type RouterOrProcedure = Router | Procedure;
