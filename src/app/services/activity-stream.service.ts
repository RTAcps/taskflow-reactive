import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval, merge } from 'rxjs';
import { map, shareReplay, startWith, takeUntil } from 'rxjs/operators';
import { ActivityType, ProjectActivity } from '../models/collaboration.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityStreamService {
  // Fonte de dados para atividades do projeto
  private projectActivities = new BehaviorSubject<ProjectActivity[]>([]);
  
  // Emissor para novas atividades
  private newActivity = new Subject<ProjectActivity>();

  // Obter todas as atividades como Observable
  public getProjectActivities(): Observable<ProjectActivity[]> {
    return this.projectActivities.asObservable();
  }

  // Obter stream de novas atividades
  public getNewActivityStream(): Observable<ProjectActivity> {
    return this.newActivity.asObservable();
  }

  // Obter contagem de atividades por tipo
  public getActivityCounts(): Observable<Record<ActivityType, number>> {
    return this.projectActivities.pipe(
      map(activities => {
        const counts: Partial<Record<ActivityType, number>> = {};
        
        // Inicializar todos os tipos com zero
        Object.values(ActivityType).forEach(type => {
          counts[type] = 0;
        });
        
        // Contar atividades por tipo
        activities.forEach(activity => {
          counts[activity.actionType] = (counts[activity.actionType] || 0) + 1;
        });
        
        return counts as Record<ActivityType, number>;
      }),
      shareReplay(1)
    );
  }

  // Adicionar nova atividade
  public addActivity(activity: ProjectActivity): void {
    const currentActivities = this.projectActivities.getValue();
    this.projectActivities.next([activity, ...currentActivities]);
    this.newActivity.next(activity);
  }

  // Simulação de atividade do projeto
  public simulateProjectActivity(): ProjectActivity {
    const actionTypes = Object.values(ActivityType);
    const randomActionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    
    const userIds = ['1', '2', '3', '4', '5'];
    const userNames = ['Alice Silva', 'Bruno Oliveira', 'Carolina Santos', 'Daniel Martins', 'Elena Costa'];
    
    const randomUserIndex = Math.floor(Math.random() * userIds.length);
    
    const projectIds = ['project-1', 'project-2'];
    const randomProjectId = projectIds[Math.floor(Math.random() * projectIds.length)];
    
    const newActivity: ProjectActivity = {
      id: `act-${Date.now()}`,
      projectId: randomProjectId,
      userId: userIds[randomUserIndex],
      userName: userNames[randomUserIndex],
      actionType: randomActionType,
      timestamp: new Date(),
      description: this.getActivityDescription(randomActionType, userNames[randomUserIndex])
    };
    
    this.addActivity(newActivity);
    return newActivity;
  }
  
  // Gerar descrição baseada no tipo de atividade
  private getActivityDescription(actionType: ActivityType, userName: string): string {
    const taskNames = ['Implementar login', 'Corrigir bug #234', 'Atualizar documentação', 'Revisar PR #45', 'Adicionar testes'];
    const randomTaskName = taskNames[Math.floor(Math.random() * taskNames.length)];
    
    switch (actionType) {
      case ActivityType.TASK_CREATED:
        return `${userName} criou a tarefa "${randomTaskName}"`;
      case ActivityType.TASK_UPDATED:
        return `${userName} atualizou a tarefa "${randomTaskName}"`;
      case ActivityType.TASK_DELETED:
        return `${userName} removeu a tarefa "${randomTaskName}"`;
      case ActivityType.TASK_MOVED:
        const columns = ['To Do', 'In Progress', 'Review', 'Done'];
        const randomColumn = columns[Math.floor(Math.random() * columns.length)];
        return `${userName} moveu "${randomTaskName}" para ${randomColumn}`;
      case ActivityType.TASK_ASSIGNED:
        const assignees = ['Alice', 'Bruno', 'Carolina', 'Daniel', 'Elena'];
        const randomAssignee = assignees[Math.floor(Math.random() * assignees.length)];
        return `${userName} atribuiu "${randomTaskName}" para ${randomAssignee}`;
      case ActivityType.TASK_COMPLETED:
        return `${userName} completou a tarefa "${randomTaskName}"`;
      case ActivityType.COMMENT_ADDED:
        return `${userName} comentou na tarefa "${randomTaskName}"`;
      case ActivityType.USER_JOINED:
        return `${userName} entrou no projeto`;
      case ActivityType.USER_LEFT:
        return `${userName} saiu do projeto`;
      default:
        return `${userName} realizou uma ação no projeto`;
    }
  }

  // Iniciar simulação automática de atividades
  public startActivitySimulation(stopSignal$: Observable<void>): void {
    interval(3000).pipe(
      takeUntil(stopSignal$),
      startWith(0) // Dispara imediatamente a primeira vez
    ).subscribe(() => {
      this.simulateProjectActivity();
    });
  }
}
