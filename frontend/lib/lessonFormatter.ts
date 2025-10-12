/**
 * Format comprehensive lesson JSON into beautiful HTML for TipTap editor
 * with proper spacing and structure
 */
export function formatLessonToHTML(lesson: any): string {
  let html = `<h1>${lesson.title || 'Untitled Lesson'}</h1>`;
  
  // Session Overview
  if (lesson.session_overview) {
    html += `<h2>📋 Session Overview</h2>`;
    html += `<p>${lesson.session_overview}</p>`;
  }
  
  // Learning Objectives
  if (lesson.learning_objectives && lesson.learning_objectives.length > 0) {
    html += `<h2>🎯 Learning Objectives</h2>`;
    html += `<ul>`;
    lesson.learning_objectives.forEach((obj: string) => {
      html += `<li>${obj}</li>`;
    });
    html += `</ul>`;
  }
  
  // Study Guide
  if (lesson.study_guide) {
    html += `<h2>📚 Study Guide for Student</h2>`;
    
    if (lesson.study_guide.key_questions && lesson.study_guide.key_questions.length > 0) {
      html += `<h3>Key Questions</h3>`;
      html += `<ul>`;
      lesson.study_guide.key_questions.forEach((q: string) => {
        html += `<li>${q}</li>`;
      });
      html += `</ul>`;
    }
    
    if (lesson.study_guide.core_concepts && lesson.study_guide.core_concepts.length > 0) {
      html += `<h3>Core Concepts</h3>`;
      html += `<ul>`;
      lesson.study_guide.core_concepts.forEach((c: string) => {
        html += `<li>${c}</li>`;
      });
      html += `</ul>`;
    }
    
    if (lesson.study_guide.visual_aids) {
      html += `<h3>Visual Aids</h3>`;
      html += `<p><em>${lesson.study_guide.visual_aids}</em></p>`;
    }
  }
  
  // Pre-class Readings
  if (lesson.pre_class_readings && lesson.pre_class_readings.length > 0) {
    html += `<h2>📖 Pre-Class Readings</h2>`;
    lesson.pre_class_readings.forEach((reading: any, index: number) => {
      html += `<h3>${index + 1}. ${reading.title}</h3>`;
      html += `<p><strong>URL:</strong> <a href="${reading.url}" target="_blank">${reading.url}</a></p>`;
      html += `<p><strong>Estimated Time:</strong> ${reading.estimated_time}</p>`;
      
      if (reading.key_takeaways && reading.key_takeaways.length > 0) {
        html += `<p><strong>Key Takeaways:</strong></p>`;
        html += `<ul>`;
        reading.key_takeaways.forEach((t: string) => {
          html += `<li>${t}</li>`;
        });
        html += `</ul>`;
      }
      
      if (reading.reading_questions && reading.reading_questions.length > 0) {
        html += `<p><strong>Reading Questions:</strong></p>`;
        html += `<ul>`;
        reading.reading_questions.forEach((q: string) => {
          html += `<li>${q}</li>`;
        });
        html += `</ul>`;
      }
    });
  }
  
  // Pre-class Work
  if (lesson.pre_class_work) {
    html += `<h2>✍️ Pre-Class Work</h2>`;
    
    if (lesson.pre_class_work.pre_assessment && lesson.pre_class_work.pre_assessment.length > 0) {
      html += `<h3>Pre-Assessment</h3>`;
      html += `<ol>`;
      lesson.pre_class_work.pre_assessment.forEach((item: any) => {
        html += `<li><strong>${item.question}</strong> <em>(${item.purpose})</em></li>`;
      });
      html += `</ol>`;
    }
    
    if (lesson.pre_class_work.reflection_prompts && lesson.pre_class_work.reflection_prompts.length > 0) {
      html += `<h3>Reflection Prompts</h3>`;
      html += `<ul>`;
      lesson.pre_class_work.reflection_prompts.forEach((p: string) => {
        html += `<li>${p}</li>`;
      });
      html += `</ul>`;
    }
    
    if (lesson.pre_class_work.preparation_tasks && lesson.pre_class_work.preparation_tasks.length > 0) {
      html += `<h3>Preparation Tasks</h3>`;
      html += `<ul>`;
      lesson.pre_class_work.preparation_tasks.forEach((t: string) => {
        html += `<li>${t}</li>`;
      });
      html += `</ul>`;
    }
  }
  
  // Class Activities
  if (lesson.class_activities && lesson.class_activities.length > 0) {
    html += `<h2>🎓 Class Activities</h2>`;
    lesson.class_activities.forEach((activity: any, index: number) => {
      html += `<h3>Activity ${index + 1}: ${activity.name} (${activity.duration} min)</h3>`;
      html += `<p>${activity.description}</p>`;
      
      if (activity.materials && activity.materials.length > 0) {
        html += `<p><strong>Materials:</strong></p>`;
        html += `<ul>`;
        activity.materials.forEach((m: string) => {
          html += `<li>${m}</li>`;
        });
        html += `</ul>`;
      }
      
      if (activity.teacher_notes) {
        html += `<p><strong>Teacher Notes:</strong> <em>${activity.teacher_notes}</em></p>`;
      }
      
      if (activity.learning_strategy) {
        html += `<p><strong>Learning Strategy:</strong> ${activity.learning_strategy}</p>`;
      }
    });
  }
  
  // Homework
  if (lesson.homework) {
    html += `<h2>📝 Homework</h2>`;
    
    if (lesson.homework.practice_tasks && lesson.homework.practice_tasks.length > 0) {
      html += `<h3>Practice Tasks</h3>`;
      html += `<ul>`;
      lesson.homework.practice_tasks.forEach((t: string) => {
        html += `<li>${t}</li>`;
      });
      html += `</ul>`;
    }
    
    if (lesson.homework.creative_project) {
      html += `<h3>Creative Project</h3>`;
      html += `<p>${lesson.homework.creative_project}</p>`;
    }
    
    if (lesson.homework.next_class_prep && lesson.homework.next_class_prep.length > 0) {
      html += `<h3>Preparation for Next Class</h3>`;
      html += `<ul>`;
      lesson.homework.next_class_prep.forEach((prep: any) => {
        html += `<li><strong>${prep.type}:</strong> ${prep.title} <a href="${prep.url}" target="_blank">(link)</a> - ${prep.time}</li>`;
      });
      html += `</ul>`;
    }
  }
  
  // Materials Summary
  if (lesson.materials_summary && lesson.materials_summary.length > 0) {
    html += `<h2>📦 Materials Summary</h2>`;
    html += `<ul>`;
    lesson.materials_summary.forEach((m: string) => {
      html += `<li>${m}</li>`;
    });
    html += `</ul>`;
  }
  
  // Cultural Adaptations
  if (lesson.cultural_adaptations) {
    html += `<h2>🌍 Cultural Adaptations</h2>`;
    html += `<p>${lesson.cultural_adaptations}</p>`;
  }
  
  return html;
}

