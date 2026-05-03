import type { IAuthzIoService } from '@univerjs/core';
import type {
  IActionInfo,
  IAllowedRequest,
  IBatchAllowedResponse,
  ICollaborator,
  ICreateRequest,
  IListPermPointRequest,
  IPermissionPoint,
  IPutCollaboratorsRequest,
  IUpdatePermPointRequest,
  IUnitRoleKV,
} from '@univerjs/protocol';
import { UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';

export class MockAuthzService implements IAuthzIoService {
  async create(_config: ICreateRequest): Promise<string> {
    return '';
  }

  async batchAllowed(config: IAllowedRequest[]): Promise<IBatchAllowedResponse['objectActions']> {
    const selectionRangeConfig = config.filter(c => c.objectType === UnitObject.SelectRange);
    if (selectionRangeConfig.length) {
      return selectionRangeConfig.map(c => ({
        unitID: c.unitID,
        objectID: c.objectID,
        actions: c.actions.map(action => ({ action, allowed: true })),
      }));
    }
    return [];
  }

  async list(_config: IListPermPointRequest): Promise<IPermissionPoint[]> {
    return [];
  }

  async listCollaborators(): Promise<ICollaborator[]> {
    return [];
  }

  async allowed(config: IAllowedRequest): Promise<IActionInfo[]> {
    return config.actions.map(action => ({
      action,
      allowed: true,
      reasons: [],
    }));
  }

  async listRoles(): Promise<{ roles: IUnitRoleKV[]; actions: UnitAction[] }> {
    return { roles: [], actions: [] };
  }

  async update(_config: IUpdatePermPointRequest): Promise<void> {}

  async updateCollaborator(): Promise<void> {}

  async createCollaborator(): Promise<void> {}

  async deleteCollaborator(): Promise<void> {}

  async putCollaborators(_config: IPutCollaboratorsRequest): Promise<void> {}
}