import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements AfterViewInit {
  // Direct string for the editor content
  editorContent = 'Welcome to the text editor with undo/redo functionality!\n\nTry selecting some text and clicking the formatting buttons above.';
  
  // Stack for undo/redo operations
  undoStack: string[] = [];
  redoStack: string[] = [];
  
  // Track selection
  selectionStart = 0;
  selectionEnd = 0;
  
  // Get reference to textarea
  @ViewChild('editor') editorElement!: ElementRef<HTMLTextAreaElement>;
  
  // Debug info
  debugInfo = 'No actions yet';
  
  ngAfterViewInit() {
    // Add initial state to undo stack
    this.saveState('Initial state');
    
    // Set focus to editor
    setTimeout(() => {
      this.editorElement.nativeElement.focus();
    }, 0);
  }
  
  // Save current state to undo stack
  saveState(action: string) {
    this.undoStack.push(this.editorContent);
    // Clear redo stack when a new action is performed
    this.redoStack = [];
    this.debugInfo = `Action: ${action} | Undo stack: ${this.undoStack.length} | Redo stack: ${this.redoStack.length}`;
    console.log(`State saved: ${action}`);
  }
  
  // Handle text changes
  onTextChange(newText: string) {
    if (this.editorContent !== newText) {
      this.editorContent = newText;
      this.saveState('Text changed');
    }
  }
  
  // Handle selection changes
  onSelectionChange(event: any) {
    const textarea = event.target as HTMLTextAreaElement;
    this.selectionStart = textarea.selectionStart;
    this.selectionEnd = textarea.selectionEnd;
    console.log(`Selection: ${this.selectionStart}-${this.selectionEnd}`);
  }
  
  // Format text in bold
  formatBold() {
    this.applyFormatting('**', '**', 'Bold text');
  }
  
  // Format text in italic
  formatItalic() {
    this.applyFormatting('_', '_', 'Italic text');
  }
  
  // Format text as heading
  formatHeading() {
    // Make sure we start on a new line for headings
    let prefix = '\n# ';
    if (this.selectionStart > 0 && this.editorContent[this.selectionStart - 1] === '\n') {
      prefix = '# ';
    }
    this.applyFormatting(prefix, '', 'Heading');
  }
  
  // Common formatting function
  private applyFormatting(prefix: string, suffix: string, defaultText: string) {
    // Ensure we have the textarea reference
    if (!this.editorElement) {
      console.error('Editor reference not available');
      return;
    }
    
    const textarea = this.editorElement.nativeElement;
    
    // Update selection if needed
    this.selectionStart = textarea.selectionStart;
    this.selectionEnd = textarea.selectionEnd;
    
    // Get selected text or use default
    const selectedText = this.editorContent.substring(this.selectionStart, this.selectionEnd);
    const textToInsert = selectedText || defaultText;
    
    // Create formatted text
    const formattedText = prefix + textToInsert + suffix;
    
    // Insert the formatted text
    const beforeText = this.editorContent.substring(0, this.selectionStart);
    const afterText = this.editorContent.substring(this.selectionEnd);
    this.editorContent = beforeText + formattedText + afterText;
    
    // Save this state
    this.saveState(`Applied formatting`);
    
    // Set focus back to editor and update cursor position
    setTimeout(() => {
      textarea.focus();
      
      // Calculate new cursor position
      const newPosition = this.selectionStart + formattedText.length;
      
      // Position cursor after the inserted text
      textarea.setSelectionRange(newPosition, newPosition);
      
      // Update our tracked selection
      this.selectionStart = newPosition;
      this.selectionEnd = newPosition;
    }, 10);
  }
  
  // Undo the last change
  undo() {
    if (this.undoStack.length <= 1) {
      return; // Keep at least the initial state
    }
    
    // Move current state to redo stack
    this.redoStack.push(this.editorContent);
    
    // Remove current state from undo stack
    this.undoStack.pop();
    
    // Set content to previous state
    this.editorContent = this.undoStack[this.undoStack.length - 1];
    
    this.debugInfo = `Action: Undo | Undo stack: ${this.undoStack.length} | Redo stack: ${this.redoStack.length}`;
    console.log('Undo performed');
    
    // Restore focus to the editor
    setTimeout(() => this.editorElement?.nativeElement.focus(), 10);
  }
  
  // Redo the last undone change
  redo() {
    if (this.redoStack.length === 0) {
      return;
    }
    
    // Get the last undone state
    const redoState = this.redoStack.pop()!;
    
    // Add current state to undo stack
    this.undoStack.push(redoState);
    
    // Update editor content
    this.editorContent = redoState;
    
    this.debugInfo = `Action: Redo | Undo stack: ${this.undoStack.length} | Redo stack: ${this.redoStack.length}`;
    console.log('Redo performed');
    
    // Restore focus to the editor
    setTimeout(() => this.editorElement?.nativeElement.focus(), 10);
  }
  
  // Clear all history
  clearHistory() {
    // Keep only the current state in the undo stack
    const currentState = this.editorContent;
    this.undoStack = [currentState];
    this.redoStack = [];
    
    this.debugInfo = `Action: Clear history | Undo stack: ${this.undoStack.length} | Redo stack: ${this.redoStack.length}`;
    console.log('History cleared');
  }
  
  get canUndo(): boolean {
    return this.undoStack.length > 1; // Keep initial state
  }
  
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}

// For compatibility with server-side rendering
export class App extends AppComponent {}