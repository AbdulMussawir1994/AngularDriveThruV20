import { Component, DestroyRef, inject, signal} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {

    // private readonly router = inject(Router);
    // private readonly destroyRef = inject(DestroyRef)

    // public showChildren = signal<boolean>(true);

    // private readonly publicRoutes = new Set([
    //     '/login',
    // ]);

    // constructor(){
    //     this.router.events
    //     .pipe(filter(event => event instanceof NavigationEnd))
    //     .subscribe((event: NavigationEnd)=>{
    //         const currentUrl = event.urlAfterRedirects.toLowerCase();
    //         const isPublic = this.publicRoutes.has(currentUrl);
    //         this.showChildren.set(!isPublic);
    //     debugger
    //         if(!isPublic && localStorage.getItem('authToken') == null){
    //             this.router.navigate(['/login']);
    //         }
    //     });

    //     this.destroyRef.onDestroy(()=>{
    //         this.showChildren.set(false);
    //     }
    // )};

}
