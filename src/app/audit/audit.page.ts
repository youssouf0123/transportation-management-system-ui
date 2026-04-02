import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuditLog } from '../models/audit-log.model';
import { ApiService } from '../services/api.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.page.html',
  styleUrls: ['./audit.page.scss'],
  standalone: false,
})
export class AuditPage implements OnInit {
  logs: AuditLog[] = [];
  filters = {
    entityType: '',
    action: '',
  };
  highlightedAuditId: number | null = null;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    public readonly i18n: I18nService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const auditId = Number(params.get('auditId'));
      this.highlightedAuditId = Number.isFinite(auditId) && auditId > 0 ? auditId : null;
      this.load();
    });
  }

  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    this.api.getAuditLogs(this.filters).subscribe({
      next: logs => {
        this.logs = logs;
        this.focusHighlightedAudit();
      },
      error: () => this.error = this.i18n.t('load_audit_error'),
    });
  }

  localizedDescription(log: AuditLog): string {
    if (this.i18n.currentLanguage !== 'fr') {
      return log.description;
    }

    return log.description
      .replace('Created trip ', 'Trajet cree ')
      .replace('Updated trip ', 'Trajet mis a jour ')
      .replace('Deleted trip ', 'Trajet supprime ')
      .replace(' to ', ' vers ')
      .replace('Created driver ', 'Chauffeur cree ')
      .replace('Updated driver ', 'Chauffeur mis a jour ')
      .replace('Deleted driver ', 'Chauffeur supprime ')
      .replace('Created vehicle ', 'Vehicule cree ')
      .replace('Updated vehicle ', 'Vehicule mis a jour ')
      .replace('Deleted vehicle ', 'Vehicule supprime ')
      .replace('Assigned driver ', 'Chauffeur affecte ')
      .replace(' to vehicle ', ' au vehicule ')
      .replace('Created maintenance record ', 'Maintenance creee ')
      .replace('Updated maintenance record ', 'Maintenance mise a jour ')
      .replace('Deleted maintenance record ', 'Maintenance supprimee ')
      .replace('Added document ', 'Document ajoute ')
      .replace('Updated document ', 'Document mis a jour ')
      .replace('Deleted document ', 'Document supprime ')
      .replace('Added miscellaneous finance record ', 'Ecriture diverse ajoutee ')
      .replace('Updated finance record ', 'Ecriture financiere mise a jour ')
      .replace('Deleted finance record ', 'Ecriture financiere supprimee ')
      .replace('Added team member ', 'Membre ajoute ')
      .replace('Changed role for ', 'Role modifie pour ')
      .replace(' to OWNER', ' en Proprietaire')
      .replace(' to MANAGER', ' en Gestionnaire')
      .replace(' to DISPATCHER', ' en Dispatcher')
      .replace(' to FINANCE', ' en Finance')
      .replace(' to VIEWER', ' en Lecteur')
      .replace('Updated team member ', 'Membre mis a jour ')
      .replace('Deleted team member ', 'Membre supprime ')
      .replace('Changed user access for ', 'Acces utilisateur modifie pour ')
      .replace('Changed platform user access for ', 'Acces utilisateur plateforme modifie pour ')
      .replace('Updated workspace ', 'Espace de travail mis a jour ')
      .replace('Changed workspace ', 'Espace de travail modifie ')
      .replace(' status to ', ' statut vers ')
      .replace('Deleted workspace ', 'Espace de travail supprime ')
      .replace('Added EARNING record for vehicle ', 'Recette ajoutee pour le vehicule ')
      .replace('Added EXPENSE record for vehicle ', 'Depense ajoutee pour le vehicule ');
  }

  private focusHighlightedAudit(): void {
    if (!this.highlightedAuditId) {
      return;
    }

    window.setTimeout(() => {
      const element = document.getElementById(`audit-record-${this.highlightedAuditId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}
