import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';

type Prefs = {
  theme: 'light'|'dark'|'focus',
  fontSize: 'small'|'medium'|'large',
  contrast: number
};

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  prefs: Prefs = { theme: 'dark', fontSize: 'medium', contrast: 1 };
  palette: string = 'obsidian';

  constructor(private themeService: ThemeService){}

  ngOnInit(): void {
    const saved = this.themeService.get();
    if (saved && typeof saved === 'object') {
      this.prefs = { ...this.prefs, ...(saved as any) };
    }
    this.palette = this.themeService.getPalette();
  }

  apply(): void {
    this.themeService.set(this.prefs);
    this.themeService.setPalette(this.palette);
    this.themeService.apply();
  }
}
