export abstract class BaseEntity {
  id!: string;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}

export abstract class TenantEntity extends BaseEntity {
  programId!: string;
  branchId!: string;
}
