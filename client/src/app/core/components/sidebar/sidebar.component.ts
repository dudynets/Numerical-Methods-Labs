import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LabGroup, LABS, LABS_GROUPS_ORDER } from '../../../lab/lab';

@Component({
  selector: 'nml-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);

  labsGroupedByType: LabGroup[] = [];

  ngOnInit(): void {
    const labsGroupedByType: LabGroup[] = [];

    for (const lab of LABS) {
      const labGroup = labsGroupedByType.find((group) => group.type === lab.type);
      if (labGroup) {
        labGroup.labs.push(lab);
      } else {
        labsGroupedByType.push({
          type: lab.type,
          labs: [lab],
        });
      }
    }

    labsGroupedByType.sort((a, b) => {
      return LABS_GROUPS_ORDER.indexOf(a.type) - LABS_GROUPS_ORDER.indexOf(b.type);
    });

    this.labsGroupedByType = labsGroupedByType;
  }

  isRouteActive(path: string): boolean {
    return this.router.url === path;
  }
}
