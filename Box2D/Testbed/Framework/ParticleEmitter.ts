/*
 * Copyright (c) 2014 Google, Inc.
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

///#if B2_ENABLE_PARTICLE

import * as box2d from "../../Box2D/Box2D";

export class EmittedParticleCallback {
  /**
   * Called for each created particle.
   */
  ParticleCreated(system: box2d.b2ParticleSystem, particleIndex: number): void {}
}

/**
 * Emit particles from a circular region.
 */
export class RadialEmitter {
  /**
   * Pointer to global world
   */
  m_particleSystem: box2d.b2ParticleSystem = null;
  /**
   * Called for each created particle.
   */
  m_callback: EmittedParticleCallback = null;
  /**
   * Center of particle emitter
   */
  m_origin: box2d.b2Vec2 = new box2d.b2Vec2();
  /**
   * Launch direction.
   */
  m_startingVelocity: box2d.b2Vec2 = new box2d.b2Vec2();
  /**
   * Speed particles are emitted
   */
  m_speed = 0.0;
  /**
   * Half width / height of particle emitter
   */
  m_halfSize: box2d.b2Vec2 = new box2d.b2Vec2();
  /**
   * Particles per second
   */
  m_emitRate = 1.0;
  /**
   * Initial color of particle emitted.
   */
  m_color: box2d.b2Color = new box2d.b2Color();
  /**
   * Number particles to emit on the next frame
   */
  m_emitRemainder = 0.0;
  /**
   * Flags for created particles, see b2ParticleFlag.
   */
  m_flags: box2d.b2ParticleFlag = box2d.b2ParticleFlag.b2_waterParticle;
  /**
   * Group to put newly created particles in.
   */
  m_group: box2d.b2ParticleGroup = null;

  /**
   * Calculate a random number 0.0..1.0.
   */
  static Random(): number {
    return Math.random();
  }

  _dtor_(): void {
    this.SetGroup(null);
  }

  /**
   * Set the center of the emitter.
   */
  SetPosition(origin: box2d.b2Vec2): void {
    this.m_origin.Copy(origin);
  }

  /**
   * Get the center of the emitter.
   */
  GetPosition(out: box2d.b2Vec2): box2d.b2Vec2 {
    return out.Copy(this.m_origin);
  }

  /**
   * Set the size of the circle which emits particles.
   */
  SetSize(size: box2d.b2Vec2): void {
    this.m_halfSize.Copy(size).SelfMul(0.5);
  }

  /**
   * Get the size of the circle which emits particles.
   */
  GetSize(out: box2d.b2Vec2): box2d.b2Vec2 {
    return out.Copy(this.m_halfSize).SelfMul(2.0);
  }

  /**
   * Set the starting velocity of emitted particles.
   */
  SetVelocity(velocity: box2d.b2Vec2): void {
    this.m_startingVelocity.Copy(velocity);
  }

  /**
   * Get the starting velocity.
   */
  GetVelocity(out: box2d.b2Vec2): box2d.b2Vec2 {
    return out.Copy(this.m_startingVelocity);
  }

  /**
   * Set the speed of particles along the direction from the
   * center of the emitter.
   */
  SetSpeed(speed: number): void {
    this.m_speed = speed;
  }

  /**
   * Get the speed of particles along the direction from the
   * center of the emitter.
   */
  GetSpeed(): number {
    return this.m_speed;
  }

  /**
   * Set the flags for created particles.
   */
  SetParticleFlags(flags: box2d.b2ParticleFlag): void {
    this.m_flags = flags;
  }

  /**
   * Get the flags for created particles.
   */
  GetParticleFlags(): box2d.b2ParticleFlag {
    return this.m_flags;
  }

  /**
   * Set the color of particles.
   */
  SetColor(color: box2d.b2Color): void {
    this.m_color.Copy(color);
  }

  /**
   * Get the color of particles emitter.
   */
  GetColor(out: box2d.b2Color): box2d.b2Color {
    return out.Copy(this.m_color);
  }

  /**
   * Set the emit rate in particles per second.
   */
  SetEmitRate(emitRate: number): void {
    this.m_emitRate = emitRate;
  }

  /**
   * Get the current emit rate.
   */
  GetEmitRate(): number {
    return this.m_emitRate;
  }

  /**
   * Set the particle system this emitter is adding particles to.
   */
  SetParticleSystem(particleSystem: box2d.b2ParticleSystem): void {
    this.m_particleSystem = particleSystem;
  }

  /**
   * Get the particle system this emitter is adding particle to.
   */
  GetParticleSystem(): box2d.b2ParticleSystem {
    return this.m_particleSystem;
  }

  /**
   * Set the callback that is called on the creation of each
   * particle.
   */
  SetCallback(callback: EmittedParticleCallback): void {
    this.m_callback = callback;
  }

  /**
   * Get the callback that is called on the creation of each
   * particle.
   */
  GetCallback(): EmittedParticleCallback {
    return this.m_callback;
  }

  /**
   * This class sets the group flags to b2_particleGroupCanBeEmpty
   * so that it isn't destroyed and clears the
   * b2_particleGroupCanBeEmpty on the group when the emitter no
   * longer references it so that the group can potentially be
   * cleaned up.
   */
  SetGroup(group: box2d.b2ParticleGroup): void {
    if (this.m_group) {
      this.m_group.SetGroupFlags(this.m_group.GetGroupFlags() & ~box2d.b2ParticleGroupFlag.b2_particleGroupCanBeEmpty);
    }
    this.m_group = group;
    if (this.m_group) {
      this.m_group.SetGroupFlags(this.m_group.GetGroupFlags() | box2d.b2ParticleGroupFlag.b2_particleGroupCanBeEmpty);
    }
  }

  /**
   * Get the group particles should be created within.
   */
  GetGroup(): box2d.b2ParticleGroup {
    return this.m_group;
  }

  /**
   * dt is seconds that have passed, particleIndices is an
   * optional pointer to an array which tracks which particles
   * have been created and particleIndicesCount is the size of the
   * particleIndices array. This function returns the number of
   * particles created during this simulation step.
   */
  Step(dt: number, particleIndices?: number[], particleIndicesCount?: number): number {
    box2d.b2Assert(this.m_particleSystem !== null);
    let numberOfParticlesCreated = 0;
    // How many (fractional) particles should we have emitted this frame?
    this.m_emitRemainder += this.m_emitRate * dt;

    let pd = new box2d.b2ParticleDef();
    pd.color.Copy(this.m_color);
    pd.flags = this.m_flags;
    pd.group = this.m_group;

    // Keep emitting particles on this frame until we only have a
    // fractional particle left.
    while (this.m_emitRemainder > 1.0) {
      this.m_emitRemainder -= 1.0;

      // Randomly pick a position within the emitter's radius.
      let angle = RadialEmitter.Random() * 2.0 * box2d.b2_pi;
      // Distance from the center of the circle.
      let distance = RadialEmitter.Random();
      let positionOnUnitCircle = new box2d.b2Vec2(Math.sin(angle), Math.cos(angle));

      // Initial position.
      pd.position.Set(
        this.m_origin.x + positionOnUnitCircle.x * distance * this.m_halfSize.x,
        this.m_origin.y + positionOnUnitCircle.y * distance * this.m_halfSize.y);
      // Send it flying
      pd.velocity.Copy(this.m_startingVelocity);
      if (this.m_speed !== 0.0) {
        ///  pd.velocity += positionOnUnitCircle * m_speed;
        pd.velocity.SelfMulAdd(this.m_speed, positionOnUnitCircle);
      }

      let particleIndex = this.m_particleSystem.CreateParticle(pd);
      if (this.m_callback) {
        this.m_callback.ParticleCreated(this.m_particleSystem, particleIndex);
      }
      if ((particleIndices !== null) && (numberOfParticlesCreated < particleIndicesCount)) {
        particleIndices[numberOfParticlesCreated] = particleIndex;
      }
      ++numberOfParticlesCreated;
    }
    return numberOfParticlesCreated;
  }
}

///#endif
