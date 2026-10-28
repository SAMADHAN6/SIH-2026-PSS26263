import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { StudentComponent } from './pages/student/student.component';
import { CollegeComponent } from './pages/college/college.component';
import { AicteComponent } from './pages/aicte/aicte.component';
import { portalGuard } from './guards/session.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'student', component: StudentComponent, canActivate: [portalGuard('student')] },
  { path: 'college', component: CollegeComponent, canActivate: [portalGuard('college')] },
  { path: 'aicte', component: AicteComponent, canActivate: [portalGuard('admin')] },
  { path: '**', redirectTo: '' }
];
