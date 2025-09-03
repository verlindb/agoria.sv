export interface ILeadershipService {
  setManager(technicalUnitId: string, employeeId: string): Promise<void>;
  clearManager(technicalUnitId: string): Promise<void>;
}
