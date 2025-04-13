// pod-shell.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-pod-shell',
  templateUrl: './pod-shell.component.html',
  styleUrls: ['./pod-shell.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class PodShellComponent implements OnInit, OnDestroy {
  @ViewChild('terminal') terminalElement!: ElementRef;
  @ViewChild('commandInput') commandInputElement!: ElementRef;

  connectionForm!: FormGroup;
  terminalOutput: string = '';
  websocket: WebSocket | null = null;
  connected: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.connectionForm = this.fb.group({
      namespace: ['', Validators.required],
      podName: ['', Validators.required],
      container: [''],
      userId: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }

  connect(): void {
    if (this.connectionForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.terminalOutput = '';

    const { namespace, podName, container, userId } = this.connectionForm.value;

    // Determine WebSocket URL (adjust based on your environment)
    const wsUrl = `ws://localhost:3000/ws/pods`;
    console.log(wsUrl);
    
    try {
      this.websocket = new WebSocket(wsUrl);

      this.websocket!.onopen = () => {
        // Send initial connection parameters
        this.websocket!.send(JSON.stringify({
          type: 'init',
          namespace,
          podName,
          container,
          userId
        }));
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'connected':
            this.connected = true;
            this.loading = false;
            this.appendToTerminal(`${data.message}\n`);
            setTimeout(() => this.focusCommandInput(), 100);
            break;

          case 'stdout':
            this.appendToTerminal(data.data);
            break;

          case 'stderr':
            this.appendToTerminal(`Error: ${data.data}`);
            break;

          case 'error':
            this.error = data.message;
            this.loading = false;
            this.appendToTerminal(`Error: ${data.message}\n`);
            break;

          case 'close':
            this.appendToTerminal(`\nConnection closed (code: ${data.code})\n`);
            this.connected = false;
            break;
        }
      };

      this.websocket.onerror = () => {
        this.error = 'WebSocket connection error';
        this.loading = false;
        this.connected = false;
      };

      this.websocket.onclose = () => {
        this.connected = false;
        this.loading = false;
      };
    } catch (err) {
      this.error = (err as Error).message;
      this.loading = false;
      this.connected = false;
    }
  }

  sendCommand(event: Event): void {
    event.preventDefault();
    
    const commandInputEl = this.commandInputElement.nativeElement;
    const command = commandInputEl.value;
    
    if (!command.trim() || !this.websocket || !this.connected) {
      return;
    }

    // Display the command in the terminal
    this.appendToTerminal(`$ ${command}\n`);
    
    // Send the command to the websocket
    this.websocket.send(JSON.stringify({
      type: 'command',
      command
    }));

    // Clear the input
    commandInputEl.value = '';
  }

  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.connected = false;
    }
  }

  disconnect(): void {
    this.disconnectWebSocket();
    this.appendToTerminal('Disconnected from pod shell.\n');
  }

  appendToTerminal(text: string): void {
    this.terminalOutput += text;
    // Scroll to bottom
    setTimeout(() => {
      if (this.terminalElement) {
        const el = this.terminalElement.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }

  focusCommandInput(): void {
    if (this.commandInputElement) {
      this.commandInputElement.nativeElement.focus();
    }
  }

  clearTerminal(): void {
    this.terminalOutput = '';
  }
}